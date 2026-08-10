import { describe, expect, it } from "vitest";

import { mimeTypeToExtension, qualityToPngColors } from "./imageCompress";

describe("mimeTypeToExtension", () => {
  it("maps common image mime types", () => {
    expect(mimeTypeToExtension("image/png")).toBe("png");
    expect(mimeTypeToExtension("image/webp")).toBe("webp");
    expect(mimeTypeToExtension("image/jpeg")).toBe("jpg");
  });
});

describe("qualityToPngColors", () => {
  it("maps high quality to lossless (0 colors = all colors)", () => {
    expect(qualityToPngColors(1)).toBe(0);
    expect(qualityToPngColors(0.98)).toBe(0);
  });

  it("maps mid/low quality to palette sizes", () => {
    expect(qualityToPngColors(0.9)).toBe(256);
    expect(qualityToPngColors(0.6)).toBe(128);
    expect(qualityToPngColors(0.45)).toBe(64);
    expect(qualityToPngColors(0.1)).toBe(16);
  });

  it("treats near-max slider as lossless", () => {
    expect(qualityToPngColors(0.99)).toBe(0);
    expect(qualityToPngColors(0.975)).not.toBe(0);
  });
});
