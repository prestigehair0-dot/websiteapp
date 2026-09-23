export type ImportKind =
  | "categories"
  | "services"
  | "staff"
  | "customers"
  | "opening_hours"
  | "appointments";

export const IMPORT_KINDS: ImportKind[] = [
  "categories",
  "services",
  "staff",
  "customers",
  "opening_hours",
  "appointments",
];

export type RowOutcome =
  | { ok: true; action: "created" | "updated" | "skipped_duplicate" }
  | { ok: false; error: string };

export type RowReport = { row: number; outcome: RowOutcome };

export type ImportReport = { rows: RowReport[] };

export type FieldSpec = {
  /** Target field name, as used in the row object passed to the importer. */
  field: string;
  required: boolean;
  /** Extra header spellings this field is recognised under, besides its own name. */
  aliases: string[];
};

export type ImportContext = { salonId: string; dryRun: boolean };

export type RowResult = { outcome: RowOutcome; createdId?: string };

export type ImportSummary = {
  totalRows: number;
  validRows: number;
  importedRows: number;
  duplicateRows: number;
  errorRows: number;
  createdRecordIds: string[];
  report: ImportReport;
};
