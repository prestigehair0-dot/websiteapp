import { adminClient } from "./client";
import { IMPORTERS } from "./runner";
import type { ImportKind } from "./types";

export async function rollbackImport(runId: string): Promise<{ kind: ImportKind; rolledBack: number }> {
  const admin = adminClient();
  const { data: run, error } = await admin.from("import_runs").select("*").eq("id", runId).maybeSingle();
  if (error) throw new Error(`Could not look up import run ${runId}: ${error.message}`);
  if (!run) throw new Error(`No import run with id ${runId}.`);
  if (run.status === "rolled_back") throw new Error(`Import run ${runId} was already rolled back.`);
  if (run.status !== "applied") {
    throw new Error(`Import run ${runId} has status "${run.status}", not "applied" -- nothing to roll back.`);
  }

  const kind = run.kind as ImportKind;
  const importer = IMPORTERS[kind];
  const ids = run.created_record_ids ?? [];
  for (const id of ids) {
    await importer.rollbackRow(id);
  }

  await admin
    .from("import_runs")
    .update({ status: "rolled_back", rolled_back_at: new Date().toISOString() })
    .eq("id", runId);

  return { kind, rolledBack: ids.length };
}
