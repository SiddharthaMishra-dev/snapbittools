import {
  IconCircleX,
  IconCloudUpload,
  IconDownload,
  IconLock,
  IconSparkles,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  BackgroundRemovalError,
  BackgroundRemovalProgress,
  BackgroundRemovalSuccess,
} from "@/workers/imageBackgroundRemoval.worker";
import ImageBackgroundRemovalWorker from "@/workers/imageBackgroundRemoval.worker.ts?worker";

type ProcessingStage = "idle" | "preparing" | "processing" | "converting" | "done" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function stageFromProgressKey(key: string, fromCache?: boolean): ProcessingStage {
  const lower = key.toLowerCase();
  // Cached assets should never look like a download step.
  if ((lower.includes("fetch") || lower.includes("load")) && !fromCache) {
    return "preparing";
  }
  if (lower.includes("encode") || lower.includes("convert")) {
    return "converting";
  }
  return "processing";
}

function friendlyProgressLabel(key: string, stage: ProcessingStage): string {
  const lower = key.toLowerCase();
  if (lower.includes("encode")) return "Saving transparent PNG…";
  if (lower.includes("mask")) return "Refining edges…";
  if (lower.includes("inference")) return "Separating subject from background…";
  if (lower.includes("decode")) return "Reading your image…";
  if (lower.includes("fetch") || lower.includes("load")) return "Getting things ready…";

  switch (stage) {
    case "preparing":
      return "Getting things ready…";
    case "converting":
      return "Converting to transparent PNG…";
    case "processing":
    default:
      return "Processing your image…";
  }
}

const STAGE_COPY: Record<"preparing" | "processing" | "converting", string> = {
  preparing: "Preparing…",
  processing: "Processing…",
  converting: "Converting…",
};

const STAGE_ORDER = ["preparing", "processing", "converting"] as const;

export function ImageBackgroundRemovalTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isProcessing = stage === "preparing" || stage === "processing" || stage === "converting";

  useEffect(() => {
    workerRef.current = new ImageBackgroundRemovalWorker();
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  const resetResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(null);
    setResultUrl(null);
    setProgress(0);
    setProgressLabel("");
  };

  const clearAll = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    resetResult();
    setSourceFile(null);
    setSourceUrl(null);
    setStage("idle");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFiles = (files: FileList | File[]) => {
    const first = Array.from(files)[0];
    if (!first || !first.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, WebP, etc.).");
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    resetResult();
    setError(null);
    setStage("idle");

    const nextUrl = URL.createObjectURL(first);
    setSourceFile(first);
    setSourceUrl(nextUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeBackground = async () => {
    if (!sourceFile || !workerRef.current || isProcessing) return;

    resetResult();
    setError(null);
    setStage("preparing");
    setProgress(0);
    setProgressLabel("Getting things ready…");

    const requestId = String(++requestIdRef.current);
    const worker = workerRef.current;

    try {
      const imageData = await sourceFile.arrayBuffer();

      await new Promise<void>((resolve, reject) => {
        const handleMessage = (
          event: MessageEvent<
            BackgroundRemovalProgress | BackgroundRemovalSuccess | BackgroundRemovalError
          >,
        ) => {
          const data = event.data;
          if (data.requestId !== requestId) return;

          if (data.type === "progress") {
            const nextStage = stageFromProgressKey(data.key, data.fromCache);
            setProgress(Math.max(data.percent, nextStage === "processing" ? 10 : 0));
            setStage(nextStage);
            setProgressLabel(friendlyProgressLabel(data.key, nextStage));
            return;
          }

          worker.removeEventListener("message", handleMessage);

          if (data.type === "error") {
            reject(new Error(data.error));
            return;
          }

          const url = URL.createObjectURL(data.blob);
          setResultBlob(data.blob);
          setResultUrl(url);
          setProgress(100);
          setStage("done");
          resolve();
        };

        worker.addEventListener("message", handleMessage);
        worker.postMessage({
          requestId,
          imageData,
          mimeType: sourceFile.type || "image/png",
          fileName: sourceFile.name,
        });
      });
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Background removal failed. Please try again.");
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !sourceFile) return;
    const basename = sourceFile.name.replace(/\.[^/.]+$/, "");
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${basename}-no-bg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            onDrop={handleDrop}
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
            <h2 className="text-2xl font-bold text-theme-heading mb-2">Upload image</h2>
            <p className="text-theme-body mb-5">
              Drag and drop a photo here, or choose a file to remove its background.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(tc.btnPrimary, "px-6 py-3")}
            >
              Select Image
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-theme-muted">
              <IconLock className="w-3.5 h-3.5" />
              Processed in your browser. Nothing is uploaded to a server.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files);
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-theme-border bg-theme-surface-muted/30 p-4">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-theme-heading truncate">{sourceFile.name}</h3>
                <p className="text-sm text-theme-body">{formatBytes(sourceFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className={cn(tc.btnDanger, "px-3 py-2 text-sm shrink-0")}
              >
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-theme-border bg-theme-surface-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-theme-muted mb-3">
                  Original
                </p>
                <img
                  src={sourceUrl || ""}
                  alt="Original preview"
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              </div>

              <div className="rounded-lg border border-theme-border bg-theme-surface-muted/30 p-5 flex flex-col justify-center gap-5">
                <div>
                  <h4 className="font-semibold text-theme-heading mb-1">AI background removal</h4>
                  <p className="text-sm text-theme-muted leading-relaxed">
                    Remove the background instantly in your browser — private, free, and ready as a
                    transparent PNG.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeBackground}
                  disabled={isProcessing}
                  className={cn(tc.btnPrimary, "w-full px-5 py-3 font-semibold")}
                >
                  <IconSparkles className={cn("w-5 h-5", isProcessing && "animate-pulse")} />
                  {isProcessing ? "Processing…" : resultUrl ? "Remove Again" : "Remove Background"}
                </button>

                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      <div className="relative overflow-hidden rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-5">
                        <motion.div
                          className="absolute inset-0 opacity-30"
                          style={{
                            background:
                              "linear-gradient(110deg, transparent 30%, color-mix(in oklab, var(--brand-primary) 40%, transparent) 50%, transparent 70%)",
                          }}
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                        />

                        <div className="relative flex items-center gap-4">
                          <div className="relative w-12 h-12 shrink-0">
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-brand-primary/30"
                              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                              transition={{ duration: 1.4, repeat: Infinity }}
                            />
                            <div className="absolute inset-1 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                            <IconSparkles className="absolute inset-0 m-auto w-5 h-5 text-brand-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-theme-heading">
                              {STAGE_COPY[stage as keyof typeof STAGE_COPY] || "Processing…"}
                            </p>
                            <p className="text-xs text-theme-muted truncate mt-0.5">
                              {progressLabel || "Processing your image…"}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-brand-primary tabular-nums">
                            {progress}%
                          </span>
                        </div>

                        <div className="relative mt-4 h-2 rounded-full bg-theme-surface-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-brand-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(progress, 4)}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          />
                        </div>

                        <div className="relative mt-3 flex gap-2">
                          {STAGE_ORDER.map((s, index) => {
                            const currentIndex = STAGE_ORDER.indexOf(
                              stage as (typeof STAGE_ORDER)[number],
                            );
                            const active = currentIndex >= index;
                            return (
                              <div
                                key={s}
                                className={cn(
                                  "h-1.5 flex-1 rounded-full transition-colors duration-300",
                                  active ? "bg-brand-primary" : "bg-theme-border",
                                )}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {error ? (
              <p className={cn(tc.alertError, "text-sm rounded-lg px-3 py-2")}>{error}</p>
            ) : null}

            <AnimatePresence>
              {resultUrl ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(tc.diffAdded, "rounded-lg border border-theme-border p-4 space-y-4")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-[var(--theme-diff-added-text)]">
                        Background removed
                      </h4>
                      <p className="text-sm text-theme-body mt-0.5">
                        Transparent PNG
                        {resultBlob ? ` · ${formatBytes(resultBlob.size)}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadResult}
                      className={cn(tc.btnSuccess, "px-4 py-2")}
                    >
                      <IconDownload className="w-4 h-4" />
                      Download PNG
                    </button>
                  </div>

                  <div
                    className="rounded-lg border border-theme-border overflow-hidden"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #c4c4c4 25%, transparent 25%), linear-gradient(-45deg, #c4c4c4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #c4c4c4 75%), linear-gradient(-45deg, transparent 75%, #c4c4c4 75%)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      backgroundColor: "#e8e8e8",
                    }}
                  >
                    <img
                      src={resultUrl}
                      alt="Background removed preview"
                      className="w-full h-auto max-h-[28rem] object-contain mx-auto"
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
