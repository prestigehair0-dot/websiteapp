/**
 * One-time importer for migrating a salon's data out of Slick and into this
 * app's Supabase schema. See docs/SLICK_MIGRATION.md for the full runbook.
 *
 * Slick exports vary by salon (different column names, different subsets of
 * columns), so there is no fixed set of expected headers: each import tries
 * to auto-match its target fields against the CSV's header row, and falls
 * back to an explicit --mapping file for whatever it can't guess.
 *
 * Usage:
 *   npx tsx scripts/import-slick.ts import <kind> <csv-file> [--dry-run] [--mapping mapping.json] [--salon slug]
 *   npx tsx scripts/import-slick.ts rollback <import-run-id>
 *
 *   kind is one of: categories, services, staff, customers, opening_hours, appointments
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the
 * environment (the same values Vercel's Production env uses -- see
 * docs/STRIPE_GOLIVE.md for where those live).
 *
 * Recommended run order, since later kinds reference earlier ones:
 *   categories -> services -> staff -> customers -> opening_hours -> appointments
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { readCsv } from "./import/csv";
import { resolveSalonId } from "./import/salon";
import { runImport } from "./import/runner";
import { rollbackImport } from "./import/rollback";
import { IMPORT_KINDS, type ImportKind } from "./import/types";

function isImportKind(value: string): value is ImportKind {
  return (IMPORT_KINDS as string[]).includes(value);
}

function loadMappingFile(path: string | undefined): Record<string, string> {
  if (!path) return {};
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${path} must be a JSON object of {"target_field": "CSV Column Name"}.`);
  }
  return parsed as Record<string, string>;
}

async function runImportCommand(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      "dry-run": { type: "boolean", default: false },
      mapping: { type: "string" },
      salon: { type: "string" },
    },
  });

  const [kind, csvPath] = positionals;
  if (!kind || !csvPath) {
    throw new Error("Usage: import-slick.ts import <kind> <csv-file> [--dry-run] [--mapping mapping.json] [--salon slug]");
  }
  if (!isImportKind(kind)) {
    throw new Error(`Unknown kind "${kind}". Expected one of: ${IMPORT_KINDS.join(", ")}.`);
  }

  const salonId = await resolveSalonId(values.salon);
  const mappingOverrides = loadMappingFile(values.mapping);

  // Preview headers up front, so a bad --mapping value or a missing column
  // shows up before anything is written.
  const { headers } = readCsv(csvPath);
  console.log(`${csvPath}: ${headers.length} columns -- ${headers.join(", ")}`);

  const { runId, summary } = await runImport({
    kind,
    csvPath,
    salonId,
    mappingOverrides,
    dryRun: values["dry-run"] === true,
  });

  console.log("");
  console.log(values["dry-run"] ? "Dry run -- nothing was written." : `Import run ${runId}`);
  console.log(
    `  ${summary.totalRows} rows: ${summary.importedRows} imported, ${summary.duplicateRows} already existed, ${summary.errorRows} failed.`,
  );

  const errors = summary.report.rows.filter((r) => !r.outcome.ok);
  if (errors.length > 0) {
    console.log("\nRows that failed:");
    for (const r of errors.slice(0, 50)) {
      if (!r.outcome.ok) console.log(`  line ${r.row}: ${r.outcome.error}`);
    }
    if (errors.length > 50) console.log(`  ...and ${errors.length - 50} more.`);
  }

  if (!values["dry-run"] && runId && summary.createdRecordIds.length > 0) {
    console.log(`\nTo undo this run: npx tsx scripts/import-slick.ts rollback ${runId}`);
  }
}

async function runRollbackCommand(args: string[]) {
  const [runId] = args;
  if (!runId) throw new Error("Usage: import-slick.ts rollback <import-run-id>");
  const { kind, rolledBack } = await rollbackImport(runId);
  console.log(`Rolled back ${rolledBack} ${kind} record(s) created by run ${runId}.`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "import") return runImportCommand(rest);
  if (command === "rollback") return runRollbackCommand(rest);
  throw new Error(
    "Usage:\n" +
      "  npx tsx scripts/import-slick.ts import <kind> <csv-file> [--dry-run] [--mapping mapping.json] [--salon slug]\n" +
      "  npx tsx scripts/import-slick.ts rollback <import-run-id>\n" +
      `  kind is one of: ${IMPORT_KINDS.join(", ")}`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
