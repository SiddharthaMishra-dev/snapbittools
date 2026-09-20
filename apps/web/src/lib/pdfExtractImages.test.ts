import { describe, expect, it } from "vitest";

import { extractedImageFileName, extractedImagesZipFileName, imageDataToRgba } from "./pdfExtractImages";

const kinds = { GRAYSCALE_1BPP: 1, RGB_24BPP: 2, RGBA_32BPP: 3 };

describe("extracted image names", () => {
  it("pads photo indexes and strips .pdf", () => {
    expect(extractedImageFileName("scan.pdf", 1, 12)).toBe("scan-photo-01.png");
    expect(extractedImageFileName("scan.pdf", 12, 12)).toBe("scan-photo-12.png");
  });

  it("names the zip from the PDF basename", () => {
    expect(extractedImagesZipFileName("holiday photos.PDF")).toBe("holiday photos-photos.zip");
  });
});

describe("imageDataToRgba", () => {
  it("expands RGB triplets to RGBA", () => {
    const rgb = new Uint8Array([10, 20, 30, 40, 50, 60]);
    const rgba = imageDataToRgba(rgb, 2, 1, kinds.RGB_24BPP, kinds);
    expect(Array.from(rgba ?? [])).toEqual([10, 20, 30, 255, 40, 50, 60, 255]);
  });

  it("passes through RGBA", () => {
    const src = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const rgba = imageDataToRgba(src, 2, 1, kinds.RGBA_32BPP, kinds);
    expect(Array.from(rgba ?? [])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("expands 8-bit grayscale", () => {
    const gray = new Uint8Array([0, 255]);
    const rgba = imageDataToRgba(gray, 2, 1, undefined, kinds);
    expect(Array.from(rgba ?? [])).toEqual([0, 0, 0, 255, 255, 255, 255, 255]);
  });
});
