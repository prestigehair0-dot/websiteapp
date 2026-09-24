import { adminClient } from "../client";
import { optionalStr, slugify, str, toBool, toInt } from "../parse";
import type { FieldSpec, ImportContext, RowResult } from "../types";

export const fields: FieldSpec[] = [
  { field: "name", required: true, aliases: ["category", "category_name"] },
  { field: "slug", required: false, aliases: ["url_slug"] },
  { field: "description", required: false, aliases: [] },
  { field: "display_order", required: false, aliases: ["order", "sort_order"] },
  { field: "is_active", required: false, aliases: ["active", "enabled"] },
];

export async function importRow(
  mapped: Record<string, string | undefined>,
  ctx: ImportContext,
): Promise<RowResult> {
  const name = str(mapped.name);
  if (!name) return { outcome: { ok: false, error: "Missing category name" } };
  const slug = slugify(optionalStr(mapped.slug) ?? name);
  if (!slug) return { outcome: { ok: false, error: `Could not derive a slug from "${name}"` } };

  const values = {
    name,
    description: optionalStr(mapped.description),
    display_order: toInt(mapped.display_order) ?? 0,
    is_active: toBool(mapped.is_active, true),
  };

  const admin = adminClient();
  const { data: existing, error: lookupError } = await admin
    .from("service_categories")
    .select("id")
    .eq("salon_id", ctx.salonId)
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) return { outcome: { ok: false, error: lookupError.message } };

  if (ctx.dryRun) return { outcome: { ok: true, action: existing ? "updated" : "created" } };

  if (existing) {
    const { error } = await admin.from("service_categories").update(values).eq("id", existing.id);
    if (error) return { outcome: { ok: false, error: error.message } };
    return { outcome: { ok: true, action: "updated" } };
  }

  const { data, error } = await admin
    .from("service_categories")
    .insert({ ...values, salon_id: ctx.salonId, slug })
    .select("id")
    .single();
  if (error || !data) return { outcome: { ok: false, error: error?.message ?? "insert failed" } };
  return { outcome: { ok: true, action: "created" }, createdId: data.id };
}

/** Undo importRow's insert. Never called for a row that only updated an existing category. */
export async function rollbackRow(id: string): Promise<void> {
  const admin = adminClient();
  await admin.from("service_categories").delete().eq("id", id);
}
