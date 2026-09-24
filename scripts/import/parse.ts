import { TZDate } from "@date-fns/tz";

const TIMEZONE = "Europe/London";

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function str(raw: string | undefined): string {
  return (raw ?? "").trim();
}

export function optionalStr(raw: string | undefined): string | null {
  const v = str(raw);
  return v === "" ? null : v;
}

/** "£45", "45.00", "45" -> 4500 pence. Returns null if unparsable. */
export function toPence(raw: string | undefined): number | null {
  const v = str(raw);
  if (v === "") return null;
  const cleaned = v.replace(/[£,\s]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function toInt(raw: string | undefined): number | null {
  const v = str(raw);
  if (v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

export function toBool(raw: string | undefined, fallback: boolean): boolean {
  const v = str(raw).toLowerCase();
  if (v === "") return fallback;
  if (["1", "y", "yes", "true", "t"].includes(v)) return true;
  if (["0", "n", "no", "false", "f"].includes(v)) return false;
  return fallback;
}

/** Comma or semicolon separated list, e.g. "Balayage; Colour correction". */
export function toList(raw: string | undefined): string[] {
  const v = str(raw);
  if (v === "") return [];
  return v
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const DAY_NAMES: Record<string, number> = {
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
  sun: 7, sunday: 7,
};

/** ISO-8601 day of week (1 = Monday .. 7 = Sunday), from a number or name. */
export function toDayOfWeek(raw: string | undefined): number | null {
  const v = str(raw).toLowerCase();
  if (v === "") return null;
  const n = Number(v);
  if (Number.isInteger(n) && n >= 1 && n <= 7) return n;
  return DAY_NAMES[v] ?? null;
}

/** "HH:MM" or "H:MM", 24-hour. Returns null if unparsable. */
export function toTimeOfDay(raw: string | undefined): string | null {
  const v = str(raw);
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(v);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** A "YYYY-MM-DD" date plus an "HH:MM" time, in the salon's timezone, as a UTC ISO instant. */
export function localToUtcIso(dateRaw: string | undefined, timeRaw: string | undefined): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str(dateRaw));
  const time = toTimeOfDay(timeRaw);
  if (!dateMatch || !time) return null;
  const [, y, mo, d] = dateMatch;
  const [h, mi] = time.split(":");
  const zoned = new TZDate(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), 0, TIMEZONE);
  if (Number.isNaN(zoned.getTime())) return null;
  // TZDate#toISOString() keeps the zone's own offset (e.g. "+01:00" in BST)
  // rather than normalising to "Z" -- go through a plain Date, which always does.
  return new Date(zoned.getTime()).toISOString();
}
