import { adminClient } from "../client";
import { optionalStr, slugify, str, toBool, toInt, toPence } from "../parse";
import type { FieldSpec, ImportContext, RowResult } from "../types";

export const fields: FieldSpec[] = [
  { field: "name", required: true, aliases: ["service", "service_name", "treatment"] },
  { field: "category", required: false, aliases: ["category_name", "category_slug"] },
  { field: "duration_minutes", required: true, aliases: ["duration", "duration_mins", "length_minutes"] },
  { field: "buffer_minutes", required: false, aliases: ["buffer", "processing_time"] },
  { field: "price", required: true, aliases: ["price_gbp", "base_price"] },
  { field: "deposit", required: false, aliases: ["deposit_gbp", "deposit_amount"] },
  { field: "description", required: false, aliases: [] },
  { field: "slug", required: false, aliases: ["url_slug"] },
  { field: "is_active", required: false, aliases: ["active", "enabled"] },
];

async function resolveCategoryId(salonId: string, nameOrSlug: string | null): Promise<string | null | "not_found"> {
  if (!nameOrSlug) return null;
  const admin = adminClient();
  const bySlug = await admin
    .from("service_categories")
    .select("id")
    .eq("salon_id", salonId)
    .eq("slug", slugify(nameOrSlug))
    .maybeSingle();
  if (bySlug.data) return bySlug.data.id;
  const byName = await admin
    .from("service_categories")
    .select("id")
    .eq("salon_id", salonId)
    .ilike("name", nameOrSlug)
    .maybeSingle();
  return byName.data?.id ?? "not_found";
}

export async function importRow(
  mapped: Record<string, string | undefined>,
  ctx: ImportContext,
): Promise<RowResult> {
  const name = str(mapped.name);
  if (!name) return { outcome: { ok: false, error: "Missing service name" } };
  const slug = slugify(optionalStr(mapped.slug) ?? name);
  if (!slug) return { outcome: { ok: false, error: `Could not derive a slug from "${name}"` } };

  const durationMinutes = toInt(mapped.duration_minutes);
  if (durationMinutes == null || durationMinutes < 5 || durationMinutes > 600) {
    return { outcome: { ok: false, error: `Invalid duration "${mapped.duration_minutes}" (expected 5-600 minutes)` } };
  }
  const bufferMinutes = toInt(mapped.buffer_minutes) ?? 0;
  if (bufferMinutes < 0 || bufferMinutes > 240) {
    return { outcome: { ok: false, error: `Invalid buffer "${mapped.buffer_minutes}" (expected 0-240 minutes)` } };
  }

  const basePricePence = toPence(mapped.price);
  if (basePricePence == null) return { outcome: { ok: false, error: `Invalid price "${mapped.price}"` } };
  const depositPence = toPence(mapped.deposit) ?? 0;
  if (depositPence > basePricePence) {
    return { outcome: { ok: false, error: `Deposit (${mapped.deposit}) is larger than the price (${mapped.price})` } };
  }

  const categoryId = await resolveCategoryId(ctx.salonId, optionalStr(mapped.category));
  if (categoryId === "not_found") {
    return { outcome: { ok: false, error: `Category "${mapped.category}" not found -- import categories first` } };
  }

  const values = {
    name,
    category_id: categoryId,
    duration_minutes: durationMinutes,
    buffer_minutes: bufferMinutes,
    base_price_pence: basePricePence,
    deposit_pence: depositPence,
    description: optionalStr(mapped.description) ?? "",
    is_active: toBool(mapped.is_active, true),
  };

  const admin = adminClient();
  const { data: existing, error: lookupError } = await admin
    .from("services")
    .select("id")
    .eq("salon_id", ctx.salonId)
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) return { outcome: { ok: false, error: lookupError.message } };

  if (ctx.dryRun) return { outcome: { ok: true, action: existing ? "updated" : "created" } };

  if (existing) {
    const { error } = await admin.from("services").update(values).eq("id", existing.id);
    if (error) return { outcome: { ok: false, error: error.message } };
    return { outcome: { ok: true, action: "updated" } };
  }

  const { data, error } = await admin
    .from("services")
    .insert({ ...values, salon_id: ctx.salonId, slug })
    .select("id")
    .single();
  if (error || !data) return { outcome: { ok: false, error: error?.message ?? "insert failed" } };
  return { outcome: { ok: true, action: "created" }, createdId: data.id };
}

export async function rollbackRow(id: string): Promise<void> {
  const admin = adminClient();
  await admin.from("services").delete().eq("id", id);
}
