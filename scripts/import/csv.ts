import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

export type CsvRow = Record<string, string>;

export type CsvFile = { headers: string[]; rows: CsvRow[] };

/** Parse a CSV export into its header row and data rows. */
export function readCsv(path: string): CsvFile {
  const text = readFileSync(path, "utf8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as CsvRow[];
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows };
}
