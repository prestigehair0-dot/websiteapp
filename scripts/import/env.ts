/**
 * This script runs under plain Node (via tsx), not inside Next's build, so it
 * cannot import src/lib/supabase/admin.ts or src/lib/env.ts -- both pull in
 * the `server-only` package, which Next provides via its own bundler alias
 * and which does not exist as a real module outside of it.
 */
export function adminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Production values, " +
        "or your local Supabase project's) before running the importer.",
    );
  }
  return { url, key };
}
