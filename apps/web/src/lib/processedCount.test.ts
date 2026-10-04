import { describe, expect, it } from "vitest";

import {
  applyReport,
  emptyProcessedCountState,
  parseProcessedReport,
  pruneSamples,
  SAMPLE_WINDOW_MS,
  toSnapshot,
} from "./processedCount";

describe("parseProcessedReport", () => {
  it("accepts a tool slug and a batch count", () => {
    expect(parseProcessedReport({ tool: "image-compressor", count: 3 })).toEqual({
      tool: "image-compressor",
      count: 3,
    });
  });

  it("rejects a missing tool, a bad slug, and a count outside 1..200", () => {
    expect(() => parseProcessedReport({ count: 1 })).toThrow(/tool/i);
    expect(() => parseProcessedReport({ tool: "Image Compressor", count: 1 })).toThrow(/tool/i);
    expect(() => parseProcessedReport({ tool: "image-compressor", count: 0 })).toThrow(/count/i);
    expect(() => parseProcessedReport({ tool: "image-compressor", count: 201 })).toThrow(/count/i);
    expect(() => parseProcessedReport({ tool: "image-compressor", count: 1.5 })).toThrow(/count/i);
  });
});

describe("applyReport", () => {
  it("adds to the lifetime total and drops samples outside the window", () => {
    const now = 1_700_000_000_000;
    const state = applyReport(
      {
        total: 10,
        samples: [{ at: now - SAMPLE_WINDOW_MS - 1, count: 4 }],
      },
      3,
      now,
    );

    expect(state.total).toBe(13);
    expect(state.samples).toEqual([{ at: now, count: 3 }]);
  });
});

describe("toSnapshot", () => {
  it("returns a zero pace when nothing finished recently", () => {
    const now = 1_700_000_000_000;
    expect(toSnapshot(emptyProcessedCountState(), now)).toEqual({
      total: 0,
      perSecond: 0,
      updatedAt: now,
    });
  });

  it("derives pace from recent completions without shrinking the lifetime total", () => {
    const now = 1_700_000_000_000;
    const state = {
      total: 100,
      samples: pruneSamples(
        [
          { at: now - SAMPLE_WINDOW_MS - 5_000, count: 40 },
          { at: now - 60_000, count: 30 },
        ],
        now,
      ),
    };

    expect(toSnapshot({ ...state, total: 100 }, now)).toEqual({
      total: 100,
      perSecond: 0.5,
      updatedAt: now,
    });
  });
});
