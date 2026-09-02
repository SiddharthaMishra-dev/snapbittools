import { describe, expect, it } from "vitest";

import { pageImageFileName, pagesZipFileName, pdfBaseName } from "./pdfToImagesNames";

describe("pdfBaseName", () => {
  it("strips a .pdf extension", () => {
    expect(pdfBaseName("invoice.pdf")).toBe("invoice");
    expect(pdfBaseName("Scan.PDF")).toBe("Scan");
  });

  it("falls back when the name is only an extension", () => {
    expect(pdfBaseName(".pdf")).toBe("document");
    expect(pdfBaseName("")).toBe("document");
  });
});

describe("pageImageFileName", () => {
  it("uses a plain name for a single-page PDF", () => {
    expect(pageImageFileName("scan.pdf", 1, 1, "jpeg")).toBe("scan.jpg");
    expect(pageImageFileName("scan.pdf", 1, 1, "png")).toBe("scan.png");
  });

  it("pads page numbers in multi-page files", () => {
    expect(pageImageFileName("report.pdf", 3, 12, "jpeg")).toBe("report-page-03.jpg");
    expect(pageImageFileName("report.pdf", 12, 12, "png")).toBe("report-page-12.png");
  });
});

describe("pagesZipFileName", () => {
  it("names the zip from the PDF basename", () => {
    expect(pagesZipFileName("contract.pdf")).toBe("contract-pages.zip");
  });
});
