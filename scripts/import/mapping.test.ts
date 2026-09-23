import { describe, expect, it } from "vitest";
import { applyMapping, resolveMapping } from "./mapping";
import type { FieldSpec } from "./types";

const FIELDS: FieldSpec[] = [
  { field: "name", required: true, aliases: ["service", "service_name"] },
  { field: "price", required: true, aliases: ["price_gbp"] },
  { field: "notes", required: false, aliases: [] },
];

describe("resolveMapping", () => {
  it("matches a field to its own header, case/punctuation-insensitively", () => {
    const { mapping, missingRequired } = resolveMapping(["Name", "Price"], FIELDS);
    expect(mapping.name).toBe("Name");
    expect(mapping.price).toBe("Price");
    expect(missingRequired).toEqual([]);
  });

  it("matches a field via one of its aliases when the exact name isn't present", () => {
    const { mapping } = resolveMapping(["Service Name", "Price (GBP)"], FIELDS);
    expect(mapping.name).toBe("Service Name");
    expect(mapping.price).toBe("Price (GBP)");
  });

  it("reports required fields it couldn't match", () => {
    const { mapping, missingRequired } = resolveMapping(["Notes"], FIELDS);
    expect(mapping.name).toBeNull();
    expect(mapping.price).toBeNull();
    expect(missingRequired.sort()).toEqual(["name", "price"]);
  });

  it("leaves an unmatched optional field as null without flagging it", () => {
    const { mapping, missingRequired } = resolveMapping(["Name", "Price"], FIELDS);
    expect(mapping.notes).toBeNull();
    expect(missingRequired).toEqual([]);
  });

  it("an explicit override wins over auto-matching", () => {
    const { mapping } = resolveMapping(["Name", "Cost"], FIELDS, { price: "Cost" });
    expect(mapping.price).toBe("Cost");
  });

  it("throws if an override points at a column the CSV doesn't have", () => {
    expect(() => resolveMapping(["Name", "Price"], FIELDS, { price: "Nope" })).toThrow(/isn't in the CSV header/);
  });
});

describe("applyMapping", () => {
  it("re-keys a row from source columns to target fields", () => {
    const row = { "Service Name": "Cut & Finish", "Price (GBP)": "45" };
    const mapping = { name: "Service Name", price: "Price (GBP)", notes: null };
    expect(applyMapping(row, mapping)).toEqual({
      name: "Cut & Finish",
      price: "45",
      notes: undefined,
    });
  });
});
