import { describe, expect, it } from "vitest";

import { buildFormSchema, fitWithin, linesToText, maskPolygons, parseChoices, rgbaToRgb, toFormKey, type FormQuestion } from "./mirage";

const question = (overrides: Partial<FormQuestion>): FormQuestion => ({
  key: "doc",
  kind: "choice",
  choices: "a, b",
  min: 0,
  max: 5,
  ...overrides,
});

describe("linesToText", () => {
  it("joins regions on the same row and orders rows top to bottom", () => {
    // Real Mirage output for a receipt: "Total" and "5.75" come back as separate regions.
    const text = linesToText([
      { string: "GROCERY RECEIPT", bbox: [35, 82, 516, 175] },
      { string: "Bread 2.25", bbox: [44, 335, 345, 428] },
      { string: "5.75", bbox: [216, 436, 308, 518] },
      { string: "Apples 2x 3.50", bbox: [50, 236, 364, 320] },
      { string: "Total", bbox: [49, 439, 142, 517] },
    ]);
    expect(text).toBe("GROCERY RECEIPT\nApples 2x 3.50\nBread 2.25\nTotal 5.75");
  });

  it("keeps lines without boxes, after the boxed ones", () => {
    expect(linesToText([{ string: "no box" }, { string: "boxed", bbox: [0, 0, 10, 10] }, { string: "  " }])).toBe("boxed\nno box");
  });
});

describe("buildFormSchema", () => {
  it("builds enum, integer, and string fields", () => {
    expect(
      buildFormSchema([
        question({ key: "Document type?", choices: "receipt, invoice, receipt, letter" }),
        question({ key: "people", kind: "number", min: 0, max: 10 }),
        question({ key: "store", kind: "text" }),
      ]),
    ).toEqual({
      schema: {
        document_type: { enum: ["receipt", "invoice", "letter"] },
        people: { type: "integer", minimum: 0, maximum: 10 },
        store: { type: "string" },
      },
    });
  });

  it("rejects empty, duplicate, and malformed questions", () => {
    expect(buildFormSchema([]).error).toMatch(/at least one/);
    expect(buildFormSchema([question({ key: "!!" })]).error).toMatch(/needs a name/);
    expect(buildFormSchema([question({}), question({ key: "DOC" })]).error).toMatch(/both named "doc"/);
    expect(buildFormSchema([question({ choices: "only" })]).error).toMatch(/two choices/);
    expect(buildFormSchema([question({ kind: "number", min: 5, max: 2 })]).error).toMatch(/range/);
    expect(buildFormSchema([question({ kind: "number", min: 0, max: 500 })]).error).toMatch(/at most 100/);
  });
});

describe("helpers", () => {
  it("normalises keys and choices", () => {
    expect(toFormKey("  Is it a Receipt? ")).toBe("is_it_a_receipt");
    expect(parseChoices(" yes, ,no,yes ")).toEqual(["yes", "no"]);
  });

  it("normalises masks to polygon lists", () => {
    expect(maskPolygons(undefined)).toEqual([]);
    expect(maskPolygons([1, 2, 3, 4])).toEqual([[1, 2, 3, 4]]);
    expect(
      maskPolygons([
        [1, 2],
        [3, 4],
      ]),
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("packs RGBA into RGB", () => {
    expect([...rgbaToRgb(new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 0]))]).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("scales large images down to the longest side", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(5120, 2560, 2560)).toEqual({ width: 2560, height: 1280 });
    expect(fitWithin(1000, 4000, 2000)).toEqual({ width: 500, height: 2000 });
  });
});
