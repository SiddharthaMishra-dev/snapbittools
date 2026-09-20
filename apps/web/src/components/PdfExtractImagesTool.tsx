import { IconCircleX, IconDownload, IconFileTypePdf, IconInfoCircle } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";

import { FileDropzone } from "@/components/FileDropzone";
import { extractPdfImages, extractedImagesZipFileName, type ExtractedPdfImage } from "@/lib/pdfExtractImages";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type Status = "idle" | "extracting" | "done" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type PhotoPreview = ExtractedPdfImage & { previewUrl: string };

export function PdfExtractImagesTool() {
  const abortRef = useRef<AbortController | null>(null);
  const photosRef = useRef<PhotoPreview[]>([]);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const isExtracting = status === "extracting";
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  const resetPhotos = () => {
    setPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      return [];
    });
    setProgress({ current: 0, total: 0 });
  };

  const clearAll = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    resetPhotos();
    setSourceFile(null);
    setStatus("idle");
    setError(null);
    setIsZipping(false);
  };

  const extractFromFile = async (file: File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    resetPhotos();
    setError(null);
    setStatus("extracting");
    setProgress({ current: 0, total: 0 });

    try {
      const pdfData = await file.arrayBuffer();
      const result = await extractPdfImages(
        {
          pdfData,
          signal: controller.signal,
          onProgress: (current, total) => setProgress({ current, total }),
        },
        file.name,
      );

      if (controller.signal.aborted) return;

      setPhotos(
        result.images.map((image) => ({
          ...image,
          previewUrl: URL.createObjectURL(image.blob),
        })),
      );
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setStatus("error");
      setError(err instanceof Error ? err.message : "Extraction failed. The PDF may be encrypted or corrupted.");
    }
  };

  const processFiles = (files: FileList | File[]) => {
    const first = Array.from(files)[0];
    if (!first) return;

    const isPdf = first.type === "application/pdf" || first.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please upload a PDF file.");
      return;
    }

    setError(null);
    setSourceFile(first);
    void extractFromFile(first);
  };

  const downloadPhoto = (photo: PhotoPreview) => {
    downloadBlob(photo.blob, photo.fileName);
  };

  const downloadZip = async () => {
    if (!sourceFile || photos.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const photo of photos) {
        zip.file(photo.fileName, photo.blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, extractedImagesZipFileName(sourceFile.name));
    } finally {
      setIsZipping(false);
    }
  };

  const progressPct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const totalOutputBytes = photos.reduce((sum, photo) => sum + photo.blob.size, 0);
  const photoCount = photos.length;
  const photoLabel = photoCount === 1 ? "photo" : "photos";

  return (
    <div className="w-full max-w-7xl flex-1 flex flex-col items-center justify-center mx-auto">
      <div className="rounded-xl shadow-lg px-0 py-4 sm:p-8 w-full max-w-5xl border border-theme-border bg-theme-surface">
        {!sourceFile ? (
          <FileDropzone
            title="Upload PDF"
            description="Drag and drop a PDF here, or choose a file to extract photos in your browser."
            buttonLabel="Select PDF"
            accept="application/pdf,.pdf"
            onFiles={processFiles}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-theme-border bg-theme-surface-muted/30 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/15 flex items-center justify-center shrink-0">
                  <IconFileTypePdf className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-theme-heading truncate">{sourceFile.name}</h3>
                  <p className="text-sm text-theme-body">{formatBytes(sourceFile.size)}</p>
                </div>
              </div>
              <button type="button" onClick={clearAll} disabled={isExtracting} className={cn(tc.btnDanger, "px-3 py-2 text-sm shrink-0")}>
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-theme-surface-muted/40 border border-theme-border text-xs text-theme-muted leading-relaxed">
              <IconInfoCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-primary" />
              <p>
                This pulls photos that are already stored in the PDF — logos, scans, and pictures — not a screenshot of each page. Tiny
                decorative images are skipped. For a picture of every page, use{" "}
                <Link to="/pdf-to-jpg" className="text-brand-primary font-medium no-underline hover:underline">
                  PDF to JPG
                </Link>
                .
              </p>
            </div>

            {isExtracting ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-theme-muted">
                  <span>
                    Scanning page {progress.current || 0}
                    {progress.total ? ` of ${progress.total}` : ""}
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-theme-surface-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-primary transition-all duration-300"
                    style={{ width: `${Math.max(progressPct, 4)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {error ? <p className={cn(tc.alertError, "text-sm rounded-lg px-3 py-2")}>{error}</p> : null}

            {status === "done" ? (
              <div className={cn(photoCount > 0 ? tc.diffAdded : "", "rounded-lg border border-theme-border p-4 space-y-4")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className={cn("font-semibold", photoCount > 0 ? "text-[var(--theme-diff-added-text)]" : "text-theme-heading")}>
                      {photoCount} {photoLabel} extracted
                    </h4>
                    <p className="text-sm text-theme-body mt-0.5">
                      {photoCount > 0
                        ? `${formatBytes(totalOutputBytes)} PNG · ready as a ZIP`
                        : "No embedded photos were found in this PDF."}
                    </p>
                  </div>
                  {photoCount > 0 ? (
                    <button type="button" onClick={downloadZip} disabled={isZipping} className={cn(tc.btnSuccess, "px-4 py-2")}>
                      <IconDownload className="w-4 h-4" />
                      {isZipping ? "Zipping…" : `Download ZIP (${photoCount})`}
                    </button>
                  ) : null}
                </div>

                {photoCount === 0 ? (
                  <p className="text-sm text-theme-muted leading-relaxed">
                    Text-only PDFs and vector drawings don’t contain extractable photos. Convert pages to images instead with{" "}
                    <Link to="/pdf-to-jpg" className="text-brand-primary font-medium no-underline hover:underline">
                      PDF to JPG
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="rounded-lg border border-theme-border bg-theme-surface overflow-hidden">
                        <div className="aspect-square bg-theme-surface-muted/50 flex items-center justify-center overflow-hidden">
                          <img
                            src={photo.previewUrl}
                            alt={photo.fileName}
                            width={photo.width}
                            height={photo.height}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="p-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-theme-heading truncate">{photo.fileName}</p>
                            <p className="text-[10px] text-theme-muted">
                              Page {photo.pageNumber} · {photo.width}×{photo.height} · {formatBytes(photo.blob.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadPhoto(photo)}
                            className={cn(tc.btnSecondary, "p-1.5 shrink-0")}
                            aria-label={`Download ${photo.fileName}`}
                          >
                            <IconDownload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
