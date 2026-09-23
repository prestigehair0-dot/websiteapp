import { adminClient } from "../client";
import { findOrCreateProfile } from "../people";
import { localToUtcIso, normalizeHeader, optionalStr, slugify, str, toPence } from "../parse";
import type { FieldSpec, ImportContext, RowResult } from "../types";
import type { Database } from "../../../src/lib/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export const fields: FieldSpec[] = [
  { field: "customer_email", required: true, aliases: ["client_email", "email"] },
  { field: "staff_name", required: true, aliases: ["stylist", "staff"] },
  { field: "service_name", required: true, aliases: ["service", "treatment"] },
  { field: "date", required: true, aliases: ["appointment_date", "visit_date"] },
  { field: "time", required: true, aliases: ["appointment_time", "start_time"] },
  { field: "status", required: false, aliases: ["booking_status", "appointment_status"] },
  { field: "price", required: false, aliases: ["price_paid", "total", "amount"] },
  { field: "notes", required: false, aliases: ["customer_notes", "comments"] },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapStatus(raw: string | undefined): BookingStatus {
  const v = normalizeHeader(str(raw));
  if (["noshow", "dna", "didnotattend"].includes(v)) return "no_show";
  if (["cancelledbysalon", "cancelledbystudio", "saloncancelled"].includes(v)) return "cancelled_by_salon";
  if (["cancelled", "canceled", "cancelledbycustomer", "cancelledbyclient"].includes(v)) return "cancelled_by_customer";
  if (["confirmed", "upcoming", "booked"].includes(v)) return "confirmed";
  return "completed"; // historical data with no recognised status: assume it happened
}

async function resolveByNameOrSlug(
  table: "staff" | "services",
  salonId: string,
  nameOrSlug: string,
): Promise<{ id: string } | null> {
  const admin = adminClient();
  const bySlug = await admin.from(table).select("id").eq("salon_id", salonId).eq("slug", slugify(nameOrSlug)).maybeSingle();
  if (bySlug.data) return bySlug.data;
  const nameColumn = table === "staff" ? "display_name" : "name";
  const byName = await admin.from(table).select("id").eq("salon_id", salonId).ilike(nameColumn, nameOrSlug).maybeSingle();
  return byName.data ?? null;
}

export async function importRow(
  mapped: Record<string, string | undefined>,
  ctx: ImportContext,
): Promise<RowResult> {
  const email = str(mapped.customer_email).toLowerCase();
  if (!EMAIL_RE.test(email)) return { outcome: { ok: false, error: `Invalid customer email "${mapped.customer_email}"` } };

  const staffName = str(mapped.staff_name);
  const serviceName = str(mapped.service_name);
  if (!staffName) return { outcome: { ok: false, error: "Missing staff name" } };
  if (!serviceName) return { outcome: { ok: false, error: "Missing service name" } };

  const startsAt = localToUtcIso(mapped.date, mapped.time);
  if (!startsAt) return { outcome: { ok: false, error: `Invalid date/time "${mapped.date} ${mapped.time}"` } };

  const admin = adminClient();

  const staff = await resolveByNameOrSlug("staff", ctx.salonId, staffName);
  if (!staff) return { outcome: { ok: false, error: `Staff "${staffName}" not found -- import staff first` } };

  const serviceRow = await admin
    .from("services")
    .select("id, duration_minutes, buffer_minutes, base_price_pence")
    .eq("salon_id", ctx.salonId)
    .eq("slug", slugify(serviceName))
    .maybeSingle();
  const service =
    serviceRow.data ??
    (
      await admin
        .from("services")
        .select("id, duration_minutes, buffer_minutes, base_price_pence")
        .eq("salon_id", ctx.salonId)
        .ilike("name", serviceName)
        .maybeSingle()
    ).data;
  if (!service) return { outcome: { ok: false, error: `Service "${serviceName}" not found -- import services first` } };

  if (ctx.dryRun) return { outcome: { ok: true, action: "created" } };

  let profileId: string;
  try {
    profileId = (await findOrCreateProfile({ email })).id;
  } catch (cause) {
    return { outcome: { ok: false, error: cause instanceof Error ? cause.message : "Could not resolve customer" } };
  }

  const status = mapStatus(mapped.status);
  const endsAt = new Date(new Date(startsAt).getTime() + service.duration_minutes * 60_000).toISOString();
  const blockedUntil = new Date(new Date(endsAt).getTime() + service.buffer_minutes * 60_000).toISOString();
  const totalPricePence = toPence(mapped.price) ?? service.base_price_pence;
  const paidInFull = status === "completed";

  const { data, error } = await admin
    .from("bookings")
    .insert({
      reference: "", // filled by the bookings_reference trigger (0006_bookings.sql)
      salon_id: ctx.salonId,
      staff_id: staff.id,
      profile_id: profileId,
      service_id: service.id,
      status,
      starts_at: startsAt,
      ends_at: endsAt,
      blocked_until: blockedUntil,
      service_price_pence: service.base_price_pence,
      total_price_pence: totalPricePence,
      deposit_pence: 0,
      deposit_paid_pence: 0,
      balance_paid_pence: paidInFull ? totalPricePence : 0,
      customer_notes: optionalStr(mapped.notes),
      source: "import",
      completed_at: status === "completed" ? endsAt : null,
    })
    .select("id")
    .single();
  if (error || !data) return { outcome: { ok: false, error: error?.message ?? "insert failed" } };
  return { outcome: { ok: true, action: "created" }, createdId: data.id };
}

/** Bookings have no soft delete -- an imported one is hard-deleted on rollback. */
export async function rollbackRow(id: string): Promise<void> {
  const admin = adminClient();
  await admin.from("bookings").delete().eq("id", id);
}
