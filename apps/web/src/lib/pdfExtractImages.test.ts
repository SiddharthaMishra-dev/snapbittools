import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import UPNG from "upng-js";

import { applyPdfImagePredictor, extractEmbeddedPdfImages } from "./pdfEmbeddedImages";
import { extractedImageFileName, extractedImagesZipFileName, imageDataToRgba } from "./pdfExtractImages";

const kinds = { GRAYSCALE_1BPP: 1, RGB_24BPP: 2, RGBA_32BPP: 3 };

describe("extracted image names", () => {
  it("names jpeg and png photos", () => {
    expect(extractedImageFileName("scan.pdf", 1, 12)).toBe("scan-photo-01.png");
    expect(extractedImageFileName("scan.pdf", 2, 12, "jpg")).toBe("scan-photo-02.jpg");
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

const TINY_JPEG = Uint8Array.from(
  atob(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAYACADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAYH/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AnwDQUeAAAAAA/9k=",
  ),
  (char) => char.charCodeAt(0),
);

function solidPng(width: number, height: number, color: [number, number, number]): Uint8Array {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
    pixels[i + 3] = 255;
  }
  return new Uint8Array(UPNG.encode([pixels.buffer], width, height, 0));
}

describe("embedded PDF images", () => {
  it("reverses a PNG None predictor row", () => {
    const row = [10, 20, 30, 40, 50, 60];
    const out = applyPdfImagePredictor(new Uint8Array([0, ...row]), 15, 2, 3, 8);
    expect(Array.from(out ?? [])).toEqual(row);
  });

  it("extracts a small image, an original JPEG, and a picture nested in a form", async () => {
    const src = await PDFDocument.create();
    const srcPage = src.addPage([120, 120]);
    const png = await src.embedPng(solidPng(10, 10, [0, 32, 180]));
    srcPage.drawImage(png, { x: 4, y: 4, width: 10, height: 10 });
    const srcLoaded = await PDFDocument.load(await src.save());

    const doc = await PDFDocument.create();
    const page = doc.addPage([400, 400]);
    const form = await doc.embedPage(srcLoaded.getPages()[0]);
    page.drawPage(form, { x: 10, y: 10, width: 120, height: 120 });
    const jpeg = await doc.embedJpg(TINY_JPEG);
    page.drawImage(jpeg, { x: 40, y: 40, width: 32, height: 24 });
    doc.addPage([200, 200]).drawImage(jpeg, { x: 0, y: 0, width: 32, height: 24 });

    const saved = await doc.save();
    const scan = await extractEmbeddedPdfImages(saved);

    const jpegs = scan.images.filter((image) => image.ext === "jpg");
    expect(jpegs).toHaveLength(1);
    expect(jpegs[0]?.width).toBe(32);
    expect(jpegs[0]?.height).toBe(24);
    expect(scan.images.some((image) => image.width === 10 && image.height === 10)).toBe(true);
    expect(scan.pagesWithImages.has(1)).toBe(true);
    expect(scan.pagesWithImages.has(2)).toBe(true);
  });
});
