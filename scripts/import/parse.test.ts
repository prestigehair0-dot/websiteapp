import { describe, expect, it } from "vitest";
import {
  localToUtcIso,
  normalizeHeader,
  slugify,
  toBool,
  toDayOfWeek,
  toInt,
  toList,
  toPence,
  toTimeOfDay,
} from "./parse";

describe("toPence", () => {
  it("parses plain and £-prefixed amounts", () => {
    expect(toPence("45")).toBe(4500);
    expect(toPence("45.50")).toBe(4550);
    expect(toPence("£45.50")).toBe(4550);
    expect(toPence("1,234.00")).toBe(123400);
  });
  it("rejects empty, negative or non-numeric input", () => {
    expect(toPence(undefined)).toBeNull();
    expect(toPence("")).toBeNull();
    expect(toPence("-5")).toBeNull();
    expect(toPence("abc")).toBeNull();
  });
});

describe("toInt", () => {
  it("parses whole numbers only", () => {
    expect(toInt("60")).toBe(60);
    expect(toInt("60.5")).toBeNull();
    expect(toInt("")).toBeNull();
  });
});

describe("toBool", () => {
  it("recognises common truthy/falsy spellings and falls back otherwise", () => {
    expect(toBool("yes", false)).toBe(true);
    expect(toBool("TRUE", false)).toBe(true);
    expect(toBool("0", true)).toBe(false);
    expect(toBool("", true)).toBe(true);
    expect(toBool("maybe", true)).toBe(true);
  });
});

describe("toList", () => {
  it("splits on commas and semicolons and trims", () => {
    expect(toList("Balayage; Colour correction, Curly cuts")).toEqual([
      "Balayage",
      "Colour correction",
      "Curly cuts",
    ]);
    expect(toList("")).toEqual([]);
  });
});

describe("toDayOfWeek", () => {
  it("accepts ISO numbers and weekday names", () => {
    expect(toDayOfWeek("1")).toBe(1);
    expect(toDayOfWeek("7")).toBe(7);
    expect(toDayOfWeek("Monday")).toBe(1);
    expect(toDayOfWeek("sun")).toBe(7);
    expect(toDayOfWeek("Wednesday")).toBe(3);
  });
  it("rejects out-of-range or unrecognised values", () => {
    expect(toDayOfWeek("0")).toBeNull();
    expect(toDayOfWeek("8")).toBeNull();
    expect(toDayOfWeek("Someday")).toBeNull();
  });
});

describe("toTimeOfDay", () => {
  it("normalises to HH:MM", () => {
    expect(toTimeOfDay("9:00")).toBe("09:00");
    expect(toTimeOfDay("09:00:00")).toBe("09:00");
    expect(toTimeOfDay("23:59")).toBe("23:59");
  });
  it("rejects invalid times", () => {
    expect(toTimeOfDay("24:00")).toBeNull();
    expect(toTimeOfDay("10:60")).toBeNull();
    expect(toTimeOfDay("not a time")).toBeNull();
  });
});

describe("localToUtcIso", () => {
  it("converts Europe/London winter time (GMT, UTC+0)", () => {
    // 10:00 on 15 Jan is GMT -- no offset from UTC.
    expect(localToUtcIso("2024-01-15", "10:00")).toBe("2024-01-15T10:00:00.000Z");
  });
  it("converts Europe/London summer time (BST, UTC+1)", () => {
    // 10:00 on 15 Jul is BST -- one hour ahead of UTC, so 09:00 UTC.
    expect(localToUtcIso("2024-07-15", "10:00")).toBe("2024-07-15T09:00:00.000Z");
  });
  it("returns null for unparsable input", () => {
    expect(localToUtcIso("15/07/2024", "10:00")).toBeNull();
    expect(localToUtcIso("2024-07-15", "")).toBeNull();
    expect(localToUtcIso(undefined, undefined)).toBeNull();
  });
});

describe("slugify", () => {
  it("lowercases, hyphenates and strips punctuation", () => {
    expect(slugify("Balayage & Colour!")).toBe("balayage-colour");
    expect(slugify("  Silk Press — Medium  ")).toBe("silk-press-medium");
  });
});

describe("normalizeHeader", () => {
  it("makes header matching case/punctuation-insensitive", () => {
    expect(normalizeHeader("Category Name")).toBe("categoryname");
    expect(normalizeHeader("category_name")).toBe("categoryname");
    expect(normalizeHeader(" Category-Name ")).toBe("categoryname");
  });
});
