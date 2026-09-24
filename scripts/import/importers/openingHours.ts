import { adminClient } from "../client";
import { toBool, toDayOfWeek, toTimeOfDay } from "../parse";
import type { FieldSpec, ImportContext, RowResult } from "../types";

export const fields: FieldSpec[] = [
  { field: "day_of_week", required: true, aliases: ["day", "weekday"] },
  { field: "opens_at", required: false, aliases: ["open", "opening_time", "from"] },
  { field: "closes_at", required: false, aliases: ["close", "closing_time", "to"] },
  { field: "is_closed", required: false, aliases: ["closed"] },
];

export async function importRow(
  mapped: Record<string, string | undefined>,
  ctx: ImportContext,
): Promise<RowResult> {
  const dayOfWeek = toDayOfWeek(mapped.day_of_week);
  if (dayOfWeek == null) {
    return { outcome: { ok: false, error: `Invalid day "${mapped.day_of_week}" (expected 1-7 or a weekday name)` } };
  }

  const opensAt = toTimeOfDay(mapped.opens_at);
  const closesAt = toTimeOfDay(mapped.closes_at);
  const isClosed = toBool(mapped.is_closed, false) || (!opensAt && !closesAt);

  if (!isClosed) {
    if (!opensAt || !closesAt) {
      return { outcome: { ok: false, error: "opens_at and closes_at are both required unless the day is closed" } };
    }
    if (closesAt <= opensAt) {
      return { outcome: { ok: false, error: `Closing time (${closesAt}) must be after opening time (${opensAt})` } };
    }
  }

  const values = {
    day_of_week: dayOfWeek,
    opens_at: opensAt ?? "00:00",
    closes_at: closesAt ?? "00:00",
    is_closed: isClosed,
  };

  const admin = adminClient();
  const { data: existing, error: lookupError } = await admin
    .from("opening_hours")
    .select("id")
    .eq("salon_id", ctx.salonId)
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();
  if (lookupError) return { outcome: { ok: false, error: lookupError.message } };

  if (ctx.dryRun) return { outcome: { ok: true, action: existing ? "updated" : "created" } };

  if (existing) {
    const { error } = await admin.from("opening_hours").update(values).eq("id", existing.id);
    if (error) return { outcome: { ok: false, error: error.message } };
    return { outcome: { ok: true, action: "updated" } };
  }

  const { data, error } = await admin
    .from("opening_hours")
    .insert({ ...values, salon_id: ctx.salonId })
    .select("id")
    .single();
  if (error || !data) return { outcome: { ok: false, error: error?.message ?? "insert failed" } };
  return { outcome: { ok: true, action: "created" }, createdId: data.id };
}

export async function rollbackRow(id: string): Promise<void> {
  const admin = adminClient();
  await admin.from("opening_hours").delete().eq("id", id);
}
