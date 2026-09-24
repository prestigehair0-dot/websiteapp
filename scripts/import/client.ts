import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/lib/supabase/types";
import { adminEnv } from "./env";

let cached: ReturnType<typeof createClient<Database>> | null = null;

/** Service-role Supabase client. Bypasses RLS -- this is a trusted CLI tool. */
export function adminClient() {
  if (cached) return cached;
  const { url, key } = adminEnv();
  cached = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
