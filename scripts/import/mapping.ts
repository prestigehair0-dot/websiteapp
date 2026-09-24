import type { CsvRow } from "./csv";
import type { FieldSpec } from "./types";
import { normalizeHeader } from "./parse";

export type Mapping = Record<string, string | null>;

/**
 * Match CSV headers to target fields by name (case/punctuation-insensitive),
 * falling back to an explicit override file for whatever a source export
 * calls something we don't recognise. There is no fixed Slick column list --
 * exports vary by salon and by Slick version -- so this always has to be able
 * to fall back to a human telling it which column is which.
 */
export function resolveMapping(
  headers: string[],
  fields: FieldSpec[],
  overrides: Record<string, string> = {},
): { mapping: Mapping; missingRequired: string[] } {
  const byNormalized = new Map(headers.map((h) => [normalizeHeader(h), h]));
  const mapping: Mapping = {};
  const missingRequired: string[] = [];

  for (const f of fields) {
    const override = overrides[f.field];
    if (override) {
      if (!headers.includes(override)) {
        throw new Error(`Mapping file points "${f.field}" at column "${override}", which isn't in the CSV header.`);
      }
      mapping[f.field] = override;
      continue;
    }
    const candidates = [f.field, ...f.aliases].map(normalizeHeader);
    const found = candidates.map((c) => byNormalized.get(c)).find((h) => h !== undefined) ?? null;
    mapping[f.field] = found;
    if (!found && f.required) missingRequired.push(f.field);
  }

  return { mapping, missingRequired };
}

/** Re-key a CSV row from source column names to target field names. */
export function applyMapping(row: CsvRow, mapping: Mapping): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [field, column] of Object.entries(mapping)) {
    out[field] = column ? row[column] : undefined;
  }
  return out;
}
