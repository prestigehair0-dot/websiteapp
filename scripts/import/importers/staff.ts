import { adminClient } from "../client";
import { optionalStr, slugify, str, toBool, toList } from "../parse";
import type { FieldSpec, ImportContext, RowResult } from "../types";

export const fields: FieldSpec[] = [
  { field: "display_name", required: true, aliases: ["name", "staff_name", "stylist"] },
  { field: "title", required: false, aliases: ["role"] },
  { field: "bio", required: false, aliases: [] },
  { field: "specialties", required: false, aliases: ["specialisms", "skills"] },
  { field: "is_bookable", required: false, aliases: ["bookable"] },
  { field: "is_active", required: false, aliases: ["active", "enabled"] },
  { field: "slug", required: false, aliases: ["url_slug"] },
];

export async function importRow(
  mapped: Record<string, string | undefined>,
  ctx: ImportContext,
): Promise<RowResult> {
  const displayName = str(mapped.display_name);
  if (!displayName) return { outcome: { ok: false, error: "Missing staff name" } };
  const slug = slugify(optionalStr(mapped.slug) ?? displayName);
  if (!slug) return { outcome: { ok: false, error: `Could not derive a slug from "${displayName}"` } };

  const values = {
    display_name: displayName,
    title: optionalStr(mapped.title),
    bio: optionalStr(mapped.bio),
    specialties: toList(mapped.specialties),
    is_bookable: toBool(mapped.is_bookable, true),
    is_active: toBool(mapped.is_active, true),
  };

  const admin = adminClient();
  const { data: existing, error: lookupError } = await admin
    .from("staff")
    .select("id")
    .eq("salon_id", ctx.salonId)
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) return { outcome: { ok: false, error: lookupError.message } };

  if (ctx.dryRun) return { outcome: { ok: true, action: existing ? "updated" : "created" } };

  if (existing) {
    const { error } = await admin.from("staff").update(values).eq("id", existing.id);
    if (error) return { outcome: { ok: false, error: error.message } };
    return { outcome: { ok: true, action: "updated" } };
  }

  const { data, error } = await admin
    .from("staff")
    .insert({ ...values, salon_id: ctx.salonId, slug })
    .select("id")
    .single();
  if (error || !data) return { outcome: { ok: false, error: error?.message ?? "insert failed" } };
  return { outcome: { ok: true, action: "created" }, createdId: data.id };
}

export async function rollbackRow(id: string): Promise<void> {
  const admin = adminClient();
  await admin.from("staff").delete().eq("id", id);
}
