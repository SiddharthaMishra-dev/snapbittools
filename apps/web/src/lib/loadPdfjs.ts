type Pdfjs = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<Pdfjs> | null = null;

/**
 * pdf.js touches DOM APIs as soon as the module evaluates, so a static import
 * crashes SSR and leaves tool pages as an empty HTML shell for crawlers.
 * Load it only when a user actually converts/compresses a PDF in the browser.
 */
export function loadPdfjs(): Promise<Pdfjs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}
