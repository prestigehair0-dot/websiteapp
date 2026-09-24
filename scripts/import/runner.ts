import { adminClient } from "./client";
import { readCsv } from "./csv";
import { applyMapping, resolveMapping } from "./mapping";
import type { ImportContext, ImportKind, ImportSummary, RowReport } from "./types";
import * as categories from "./importers/categories";
import * as services from "./importers/services";
import * as staff from "./importers/staff";
import * as customers from "./importers/customers";
import * as openingHours from "./importers/openingHours";
import * as appointments from "./importers/appointments";

export const IMPORTERS = {
  categories,
  services,
  staff,
  customers,
  opening_hours: openingHours,
  appointments,
} satisfies Record<ImportKind, { fields: unknown; importRow: unknown; rollbackRow: unknown }>;

export type RunOptions = {
  kind: ImportKind;
  csvPath: string;
  salonId: string;
  mappingOverrides: Record<string, string>;
  dryRun: boolean;
};

export async function runImport(opts: RunOptions): Promise<{ runId: string | null; summary: ImportSummary }> {
  const importer = IMPORTERS[opts.kind];
  const { headers, rows } = readCsv(opts.csvPath);
  if (rows.length === 0) throw new Error(`${opts.csvPath} has no data rows.`);

  const { mapping, missingRequired } = resolveMapping(headers, importer.fields, opts.mappingOverrides);
  if (missingRequired.length > 0) {
    throw new Error(
      `Could not match these required fields to a CSV column: ${missingRequired.join(", ")}.\n` +
        `Columns found in the file: ${headers.join(", ")}.\n` +
        `Pass --mapping pointing at a JSON file like {"${missingRequired[0]}": "Your Column Name"} to fix this.`,
    );
  }

  const admin = adminClient();
  let runId: string | null = null;
  if (!opts.dryRun) {
    const { data, error } = await admin
      .from("import_runs")
      .insert({
        salon_id: opts.salonId,
        kind: opts.kind,
        status: "draft",
        source_filename: opts.csvPath,
        field_mapping: mapping,
        total_rows: rows.length,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`Could not start the import run: ${error?.message}`);
    runId = data.id;
  }

  const ctx: ImportContext = { salonId: opts.salonId, dryRun: opts.dryRun };
  const reportRows: RowReport[] = [];
  const createdRecordIds: string[] = [];
  let importedRows = 0;
  let duplicateRows = 0;
  let errorRows = 0;

  for (let i = 0; i < rows.length; i++) {
    const mappedRow = applyMapping(rows[i], mapping);
    // Rows are inserted one at a time so a bad row (e.g. an overlap violation) doesn't abort the whole batch.
    const result = await importer.importRow(mappedRow, ctx);
    reportRows.push({ row: i + 2, outcome: result.outcome }); // +2: header is line 1, data is 1-indexed
    if (result.outcome.ok) {
      if (result.outcome.action === "skipped_duplicate") duplicateRows++;
      else importedRows++;
      if (result.createdId) createdRecordIds.push(result.createdId);
    } else {
      errorRows++;
    }
  }

  const summary: ImportSummary = {
    totalRows: rows.length,
    validRows: rows.length - errorRows,
    importedRows,
    duplicateRows,
    errorRows,
    createdRecordIds,
    report: { rows: reportRows },
  };

  if (runId) {
    await admin
      .from("import_runs")
      .update({
        status: "applied",
        valid_rows: summary.validRows,
        imported_rows: summary.importedRows,
        duplicate_rows: summary.duplicateRows,
        error_rows: summary.errorRows,
        created_record_ids: summary.createdRecordIds,
        report: summary.report,
        applied_at: new Date().toISOString(),
      })
      .eq("id", runId);
  }

  return { runId, summary };
}
