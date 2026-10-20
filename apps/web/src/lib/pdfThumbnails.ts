import { loadPdfjs } from "@/lib/loadPdfjs";
import { friendlyPdfError } from "@/lib/pdfPages";

const MAX_EDGE = 280;

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not draw a preview for this page."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.72,
    );
  });
}

/**
 * Low-resolution page previews for the organizer. The download still copies
 * the original PDF pages; these images are only for the on-screen grid.
 */
export async function renderPdfPagePreviews(
  pdfData: ArrayBuffer,
  onPage: (pageIndex: number, blob: Blob) => void,
  shouldContinue: () => boolean = () => true,
): Promise<void> {
  const dataCopy = pdfData.slice(0);
  const { getDocument } = await loadPdfjs();

  try {
    const loadingTask = getDocument({
      data: dataCopy,
      useSystemFonts: true,
      disableFontFace: false,
    });
    const pdf = await loadingTask.promise;

    try {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (!shouldContinue()) return;

        const page = await pdf.getPage(pageNumber);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(1.25, MAX_EDGE / Math.max(base.width, base.height, 1));
        const viewport = page.getViewport({ scale });
        const width = Math.max(1, Math.floor(viewport.width));
        const height = Math.max(1, Math.floor(viewport.height));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Canvas is not available in this browser.");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const blob = await canvasToJpeg(canvas);
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();

        if (!shouldContinue()) return;
        onPage(pageNumber - 1, blob);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    } finally {
      await loadingTask.destroy();
    }
  } catch (err) {
    throw friendlyPdfError(err, "Page previews could not be loaded.");
  }
}
