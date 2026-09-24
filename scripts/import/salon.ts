import { adminClient } from "./client";

/** The salon to import into: `--salon <slug>` if given, else the oldest salon row. */
export async function resolveSalonId(slug?: string): Promise<string> {
  const admin = adminClient();
  const query = admin.from("salons").select("id, slug").order("created_at", { ascending: true });
  const { data, error } = slug ? await query.eq("slug", slug).maybeSingle() : await query.limit(1).maybeSingle();
  if (error) throw new Error(`Could not look up the salon: ${error.message}`);
  if (!data) throw new Error(slug ? `No salon with slug "${slug}".` : "No salon configured. Run the migrations and seed first.");
  return data.id;
}
