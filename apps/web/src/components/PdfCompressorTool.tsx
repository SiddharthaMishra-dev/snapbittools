import {
  IconCircleX,
  IconCloudUpload,
  IconDownload,
  IconLock,
  IconFileTypePdf,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import {
  compressPdfClient,
  PDF_COMPRESS_PRESETS,
  type PdfCompressPreset,
} from "@/lib/pdfCompress";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type Status = "idle" | "ready" | "compressing" | "done" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PdfCompressorTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<PdfCompressPreset>("balanced");
  const [quality, setQuality] = useState(PDF_COMPRESS_PRESETS.balanced.quality);
  const [dpi, setDpi] = useState(PDF_COMPRESS_PRESETS.balanced.dpi);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [usedOriginal, setUsedOriginal] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const isCompressing = status === "compressing";

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const resetResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(null);
    setResultUrl(null);
    setOutputSize(0);
    setUsedOriginal(false);
    setPageCount(0);
    setProgress({ current: 0, total: 0 });
  };

  const clearAll = () => {
    resetResult();
    setSourceFile(null);
    setStatus("idle");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFiles = (files: FileList | File[]) => {
    const first = Array.from(files)[0];
    if (!first) return;

    const isPdf =
      first.type === "application/pdf" || first.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please upload a PDF file.");
      return;
    }

    resetResult();
    setError(null);
    setSourceFile(first);
    setStatus("ready");
  };

  const applyPreset = (next: PdfCompressPreset) => {
    setPreset(next);
    setQuality(PDF_COMPRESS_PRESETS[next].quality);
    setDpi(PDF_COMPRESS_PRESETS[next].dpi);
    if (status === "done") {
      resetResult();
      setStatus("ready");
    }
  };

  const handleQualityChange = (value: number) => {
    setQuality(value);
    if (status === "done") {
      resetResult();
      setStatus("ready");
    }
  };

  const handleDpiChange = (value: number) => {
    setDpi(value);
    if (status === "done") {
      resetResult();
      setStatus("ready");
    }
  };

  const compress = async () => {
    if (!sourceFile || isCompressing) return;

    resetResult();
    setError(null);
    setStatus("compressing");
    setProgress({ current: 0, total: 0 });

    try {
      const pdfData = await sourceFile.arrayBuffer();
      const result = await compressPdfClient({
        pdfData,
        quality,
        dpi,
        onProgress: (current, total) => setProgress({ current, total }),
      });

      const url = URL.createObjectURL(result.blob);
      setResultBlob(result.blob);
      setResultUrl(url);
      setOutputSize(result.outputSize);
      setUsedOriginal(result.usedOriginal);
      setPageCount(result.pageCount);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Compression failed. The PDF may be encrypted or corrupted.",
      );
    }
  };

  const download = () => {
    if (!resultUrl || !sourceFile) return;
    const base = sourceFile.name.replace(/\.pdf$/i, "");
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${base}-compressed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savings =
    sourceFile && outputSize > 0 && outputSize < sourceFile.size
      ? Math.round(((sourceFile.size - outputSize) / sourceFile.size) * 100)
      : 0;

  const progressPct =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

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
              isDragging
                ? "border-brand-primary bg-brand-primary/20"
                : "border-theme-border hover:border-brand-primary/40",
            )}
          >
            <IconCloudUpload
              className={cn(
                "h-14 w-14 mx-auto mb-4 transition-colors",
                isDragging ? "text-brand-primary" : "text-theme-muted",
              )}
            />
            <h2 className="text-2xl font-bold text-theme-heading mb-2">Upload PDF</h2>
            <p className="text-theme-body mb-5">
              Drag and drop a PDF here, or choose a file to compress in your browser.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(tc.btnPrimary, "px-6 py-3")}
            >
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
                  <h3 className="text-lg font-semibold text-theme-heading truncate">
                    {sourceFile.name}
                  </h3>
                  <p className="text-sm text-theme-body">{formatBytes(sourceFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearAll}
                disabled={isCompressing}
                className={cn(tc.btnDanger, "px-3 py-2 text-sm shrink-0")}
              >
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">
                Compression preset
              </p>
              <div className="grid sm:grid-cols-3 gap-2">
                {(Object.keys(PDF_COMPRESS_PRESETS) as PdfCompressPreset[]).map((key) => {
                  const p = PDF_COMPRESS_PRESETS[key];
                  const active =
                    preset === key &&
                    Math.abs(quality - p.quality) < 0.01 &&
                    dpi === p.dpi;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isCompressing}
                      onClick={() => applyPreset(key)}
                      className={cn(
                        "text-left p-4 rounded-lg border transition-all",
                        active
                          ? "border-brand-primary bg-brand-primary/10"
                          : "border-theme-border bg-theme-surface-muted/30 hover:border-brand-primary/40",
                      )}
                    >
                      <p className="font-semibold text-theme-heading text-sm">{p.label}</p>
                      <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-theme-body">JPEG quality</label>
                  <span className="text-sm text-brand-primary font-medium">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={0.95}
                  step={0.05}
                  value={quality}
                  disabled={isCompressing}
                  onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-theme-surface-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-theme-muted mt-1">
                  <span>Smaller</span>
                  <span>Sharper</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-theme-body">Render DPI</label>
                  <span className="text-sm text-brand-primary font-medium">{dpi}</span>
                </div>
                <input
                  type="range"
                  min={72}
                  max={150}
                  step={6}
                  value={dpi}
                  disabled={isCompressing}
                  onChange={(e) => handleDpiChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-theme-surface-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-theme-muted mt-1">
                  <span>72 (email)</span>
                  <span>150 (print-ish)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-theme-surface-muted/40 border border-theme-border text-xs text-theme-muted leading-relaxed">
              <IconInfoCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-primary" />
              <p>
                Pages are rasterized and re-encoded as JPEG. Text won’t stay selectable — great for
                scans and image-heavy PDFs. Already-optimized files may not shrink further.
              </p>
            </div>

            {/* Future server mode hook */}
            <div className="rounded-lg border border-dashed border-theme-border p-4 opacity-70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-theme-heading">
                    Enhanced compression (server)
                  </p>
                  <p className="text-xs text-theme-muted mt-0.5">
                    Coming soon — optional stronger compression with explicit upload consent.
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded bg-theme-surface-muted text-theme-muted shrink-0">
                  Soon
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={compress}
              disabled={isCompressing}
              className={cn(tc.btnPrimary, "w-full px-5 py-3 font-semibold")}
            >
              {isCompressing ? "Compressing…" : "Compress PDF"}
            </button>

            {isCompressing ? (
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

            {error ? (
              <p className={cn(tc.alertError, "text-sm rounded-lg px-3 py-2")}>{error}</p>
            ) : null}

            {status === "done" && resultBlob ? (
              <div
                className={cn(tc.diffAdded, "rounded-lg border border-theme-border p-4 space-y-4")}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[var(--theme-diff-added-text)]">
                      {usedOriginal ? "Already optimized" : "Compression complete"}
                    </h4>
                    <p className="text-sm text-theme-body mt-0.5">
                      {pageCount} page{pageCount === 1 ? "" : "s"} · {formatBytes(sourceFile.size)} →{" "}
                      {formatBytes(outputSize)}
                      {!usedOriginal && savings > 0 ? ` · −${savings}%` : ""}
                    </p>
                    {usedOriginal ? (
                      <p className="text-xs text-theme-muted mt-1">
                        Compressed output wasn’t smaller, so we kept your original file.
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={download}
                    className={cn(tc.btnSuccess, "px-4 py-2")}
                  >
                    <IconDownload className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
