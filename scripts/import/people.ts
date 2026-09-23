import { adminClient } from "./client";

export type PersonInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  marketingEmail?: boolean | null;
  marketingSms?: boolean | null;
};

/**
 * Find the profile for an email, or create it via a new auth user.
 *
 * profiles.id references auth.users(id), so a row can't be inserted
 * directly -- public.handle_new_user() (0002_identity.sql) creates the
 * profile (and the 'customer' role) as a trigger on auth.users insert. This
 * app is passwordless (magic-link/OTP), so the new user needs no password;
 * they sign in with this email whenever they're ready.
 */
export async function findOrCreateProfile(
  input: PersonInput,
): Promise<{ id: string; created: boolean }> {
  const admin = adminClient();
  const email = input.email.trim();

  const { data: existing, error: lookupError } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();
  if (lookupError) throw new Error(`Profile lookup failed for ${email}: ${lookupError.message}`);
  if (existing) return { id: existing.id, created: false };

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      first_name: input.firstName ?? "",
      last_name: input.lastName ?? "",
      phone: input.phone ?? undefined,
    },
  });
  if (createError || !created.user) {
    throw new Error(`Could not create an account for ${email}: ${createError?.message ?? "unknown error"}`);
  }

  if (input.marketingEmail != null || input.marketingSms != null) {
    const patch: { marketing_email?: boolean; marketing_sms?: boolean } = {};
    if (input.marketingEmail != null) patch.marketing_email = input.marketingEmail;
    if (input.marketingSms != null) patch.marketing_sms = input.marketingSms;
    await admin.from("profiles").update(patch).eq("id", created.user.id);
  }

  return { id: created.user.id, created: true };
}

/** Read-only check for dry runs: is there already a profile for this email? */
export async function profileExists(email: string): Promise<boolean> {
  const admin = adminClient();
  const { data } = await admin.from("profiles").select("id").eq("email", email.trim()).is("deleted_at", null).maybeSingle();
  return !!data;
}

/** Undo findOrCreateProfile's creation: deletes the auth user (cascades to profiles/user_roles). */
export async function deleteCreatedProfile(id: string): Promise<void> {
  const admin = adminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(`Could not remove profile ${id}: ${error.message}`);
}
