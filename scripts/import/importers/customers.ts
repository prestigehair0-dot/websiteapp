import { deleteCreatedProfile, findOrCreateProfile, profileExists } from "../people";
import { optionalStr, str, toBool } from "../parse";
import type { FieldSpec, ImportContext, RowResult } from "../types";

export const fields: FieldSpec[] = [
  { field: "email", required: true, aliases: ["email_address"] },
  { field: "first_name", required: false, aliases: ["firstname", "given_name"] },
  { field: "last_name", required: false, aliases: ["lastname", "surname", "family_name"] },
  { field: "phone", required: false, aliases: ["phone_number", "mobile"] },
  { field: "marketing_email", required: false, aliases: ["email_opt_in", "email_consent"] },
  { field: "marketing_sms", required: false, aliases: ["sms_opt_in", "sms_consent"] },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function importRow(
  mapped: Record<string, string | undefined>,
  ctx: ImportContext,
): Promise<RowResult> {
  const email = str(mapped.email).toLowerCase();
  if (!EMAIL_RE.test(email)) return { outcome: { ok: false, error: `Invalid email "${mapped.email}"` } };

  if (ctx.dryRun) {
    const exists = await profileExists(email);
    return { outcome: { ok: true, action: exists ? "skipped_duplicate" : "created" } };
  }

  try {
    const result = await findOrCreateProfile({
      email,
      firstName: optionalStr(mapped.first_name),
      lastName: optionalStr(mapped.last_name),
      phone: optionalStr(mapped.phone),
      marketingEmail: mapped.marketing_email != null ? toBool(mapped.marketing_email, false) : null,
      marketingSms: mapped.marketing_sms != null ? toBool(mapped.marketing_sms, false) : null,
    });
    if (!result.created) return { outcome: { ok: true, action: "skipped_duplicate" } };
    return { outcome: { ok: true, action: "created" }, createdId: result.id };
  } catch (cause) {
    return { outcome: { ok: false, error: cause instanceof Error ? cause.message : "Could not create customer" } };
  }
}

export async function rollbackRow(id: string): Promise<void> {
  await deleteCreatedProfile(id);
}
