import { IconCircleX, IconCloudUpload, IconDownload, IconFileTypePdf, IconInfoCircle, IconLock } from "@tabler/icons-react";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";

import {
  convertPdfToImages,
  pagesZipFileName,
  PDF_TO_IMAGE_DPI_PRESETS,
  type PdfImageFormat,
  type PdfPageImage,
  type PdfToImageDpiPreset,
} from "@/lib/pdfToImages";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type Status = "idle" | "ready" | "converting" | "done" | "error";

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

type PagePreview = PdfPageImage & { previewUrl: string };

export function PdfToJpgTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pagesRef = useRef<PagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<PdfImageFormat>("jpeg");
  const [dpi, setDpi] = useState(PDF_TO_IMAGE_DPI_PRESETS.screen.dpi);
  const [quality, setQuality] = useState(0.85);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const isConverting = status === "converting";
  pagesRef.current = pages;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      pagesRef.current.forEach((page) => URL.revokeObjectURL(page.previewUrl));
    };
  }, []);

  const resetPages = () => {
    setPages((prev) => {
      prev.forEach((page) => URL.revokeObjectURL(page.previewUrl));
      return [];
    });
    setProgress({ current: 0, total: 0 });
  };

  const clearAll = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    resetPages();
    setSourceFile(null);
    setStatus("idle");
    setError(null);
    setIsZipping(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFiles = (files: FileList | File[]) => {
    const first = Array.from(files)[0];
    if (!first) return;

    const isPdf = first.type === "application/pdf" || first.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please upload a PDF file.");
      return;
    }

    abortRef.current?.abort();
    abortRef.current = null;
    resetPages();
    setError(null);
    setSourceFile(first);
    setStatus("ready");
  };

  const applyDpiPreset = (next: PdfToImageDpiPreset) => {
    setDpi(PDF_TO_IMAGE_DPI_PRESETS[next].dpi);
    if (status === "done") {
      resetPages();
      setStatus("ready");
    }
  };

  const handleQualityChange = (value: number) => {
    setQuality(value);
    if (status === "done") {
      resetPages();
      setStatus("ready");
    }
  };

  const handleDpiChange = (value: number) => {
    setDpi(value);
    if (status === "done") {
      resetPages();
      setStatus("ready");
    }
  };

  const handleFormatChange = (next: PdfImageFormat) => {
    setFormat(next);
    if (status === "done") {
      resetPages();
      setStatus("ready");
    }
  };

  const convert = async () => {
    if (!sourceFile || isConverting) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    resetPages();
    setError(null);
    setStatus("converting");
    setProgress({ current: 0, total: 0 });

    try {
      const pdfData = await sourceFile.arrayBuffer();
      const result = await convertPdfToImages(
        {
          pdfData,
          format,
          quality,
          dpi,
          signal: controller.signal,
          onProgress: (current, total) => setProgress({ current, total }),
        },
        sourceFile.name,
      );

      if (controller.signal.aborted) return;

      setPages(
        result.pages.map((page) => ({
          ...page,
          previewUrl: URL.createObjectURL(page.blob),
        })),
      );
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setStatus("error");
      setError(err instanceof Error ? err.message : "Conversion failed. The PDF may be encrypted or corrupted.");
    }
  };

  const downloadPage = (page: PagePreview) => {
    downloadBlob(page.blob, page.fileName);
  };

  const downloadAllAsZip = async () => {
    if (!sourceFile || pages.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      if (pages.length === 1) {
        downloadPage(pages[0]);
        return;
      }

      const zip = new JSZip();
      for (const page of pages) {
        zip.file(page.fileName, page.blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, pagesZipFileName(sourceFile.name));
    } finally {
      setIsZipping(false);
    }
  };

  const progressPct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const totalOutputBytes = pages.reduce((sum, page) => sum + page.blob.size, 0);
  const outputLabel = format === "png" ? "PNG" : "JPG";

  return (
    <div className="w-full max-w-7xl flex-1 flex flex-col items-center justify-center mx-auto">
      <div className="rounded-xl shadow-lg px-0 py-4 sm:p-8 w-full max-w-5xl border border-theme-border bg-theme-surface">
        {!sourceFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              processFiles(e.dataTransfer.files);
            }}
            className={cn(
              "border-3 border-dashed rounded-lg p-12 text-center transition-all duration-300",
              isDragging ? "border-brand-primary bg-brand-primary/20" : "border-theme-border hover:border-brand-primary/40",
            )}
          >
            <IconCloudUpload
              className={cn("h-14 w-14 mx-auto mb-4 transition-colors", isDragging ? "text-brand-primary" : "text-theme-muted")}
            />
            <h2 className="text-2xl font-bold text-theme-heading mb-2">Upload PDF</h2>
            <p className="text-theme-body mb-5">Drag and drop a PDF here, or choose a file to convert to JPG in your browser.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className={cn(tc.btnPrimary, "px-6 py-3")}>
              Select PDF
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-theme-muted">
              <IconLock className="w-3.5 h-3.5" />
              Private mode — processed on your device. Nothing is uploaded.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files);
              }}
            />
          </div>
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
              <button type="button" onClick={clearAll} disabled={isConverting} className={cn(tc.btnDanger, "px-3 py-2 text-sm shrink-0")}>
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Output format</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "jpeg", label: "JPG", hint: "Smaller files, best for photos and sharing" },
                    { value: "png", label: "PNG", hint: "Lossless — sharper text and diagrams" },
                  ] as const
                ).map((option) => {
                  const active = format === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isConverting}
                      onClick={() => handleFormatChange(option.value)}
                      className={cn(
                        "text-left p-4 rounded-lg border transition-all",
                        active
                          ? "border-brand-primary bg-brand-primary/10"
                          : "border-theme-border bg-theme-surface-muted/30 hover:border-brand-primary/40",
                      )}
                    >
                      <p className="font-semibold text-theme-heading text-sm">{option.label}</p>
                      <p className="text-xs text-theme-muted mt-1 leading-relaxed">{option.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Resolution</p>
              <div className="grid sm:grid-cols-3 gap-2">
                {(Object.keys(PDF_TO_IMAGE_DPI_PRESETS) as PdfToImageDpiPreset[]).map((key) => {
                  const p = PDF_TO_IMAGE_DPI_PRESETS[key];
                  const active = dpi === p.dpi;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isConverting}
                      onClick={() => applyDpiPreset(key)}
                      className={cn(
                        "text-left p-4 rounded-lg border transition-all",
                        active
                          ? "border-brand-primary bg-brand-primary/10"
                          : "border-theme-border bg-theme-surface-muted/30 hover:border-brand-primary/40",
                      )}
                    >
                      <p className="font-semibold text-theme-heading text-sm">
                        {p.label} · {p.dpi} DPI
                      </p>
                      <p className="text-xs text-theme-muted mt-1 leading-relaxed">{p.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={cn("grid gap-5", format === "jpeg" ? "sm:grid-cols-2" : "")}>
              {format === "jpeg" ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-theme-body">JPEG quality</label>
                    <span className="text-sm text-brand-primary font-medium">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={0.95}
                    step={0.05}
                    value={quality}
                    disabled={isConverting}
                    onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-theme-surface-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-theme-muted mt-1">
                    <span>Smaller</span>
                    <span>Sharper</span>
                  </div>
                </div>
              ) : null}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-theme-body">Render DPI</label>
                  <span className="text-sm text-brand-primary font-medium">{dpi}</span>
                </div>
                <input
                  type="range"
                  min={72}
                  max={300}
                  step={6}
                  value={dpi}
                  disabled={isConverting}
                  onChange={(e) => handleDpiChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-theme-surface-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-theme-muted mt-1">
                  <span>72 (web)</span>
                  <span>300 (print)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-theme-surface-muted/40 border border-theme-border text-xs text-theme-muted leading-relaxed">
              <IconInfoCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-primary" />
              <p>
                Each PDF page is rendered in your browser and saved as {outputLabel}. Text becomes pixels — great for sharing scans, forms,
                and slides. Very large pages are capped so the tab stays stable.
              </p>
            </div>

            <button type="button" onClick={convert} disabled={isConverting} className={cn(tc.btnPrimary, "w-full px-5 py-3 font-semibold")}>
              {isConverting ? "Converting…" : `Convert to ${outputLabel}`}
            </button>

            {isConverting ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-theme-muted">
                  <span>
                    Page {progress.current || 0}
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

            {status === "done" && pages.length > 0 ? (
              <div className={cn(tc.diffAdded, "rounded-lg border border-theme-border p-4 space-y-4")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[var(--theme-diff-added-text)]">Conversion complete</h4>
                    <p className="text-sm text-theme-body mt-0.5">
                      {pages.length} page{pages.length === 1 ? "" : "s"} · {formatBytes(totalOutputBytes)} {outputLabel}
                    </p>
                  </div>
                  <button type="button" onClick={downloadAllAsZip} disabled={isZipping} className={cn(tc.btnSuccess, "px-4 py-2")}>
                    <IconDownload className="w-4 h-4" />
                    {isZipping ? "Zipping…" : pages.length === 1 ? `Download ${outputLabel}` : `Download ZIP (${pages.length})`}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {pages.map((page) => (
                    <div key={page.pageNumber} className="rounded-lg border border-theme-border bg-theme-surface overflow-hidden">
                      <div className="aspect-[3/4] bg-theme-surface-muted/50 flex items-center justify-center overflow-hidden">
                        <img src={page.previewUrl} alt={`Page ${page.pageNumber}`} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="p-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-theme-heading truncate">Page {page.pageNumber}</p>
                          <p className="text-[10px] text-theme-muted">
                            {page.width}×{page.height} · {formatBytes(page.blob.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadPage(page)}
                          className={cn(tc.btnSecondary, "p-1.5 shrink-0")}
                          aria-label={`Download page ${page.pageNumber}`}
                        >
                          <IconDownload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <style>
        {`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
          border: none;
        }
      `}{" "}
      </style>
    </div>
  );
}
