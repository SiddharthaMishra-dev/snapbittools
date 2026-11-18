import {
  IconCircleX,
  IconClipboardText,
  IconCopy,
  IconDownload,
  IconEye,
  IconMessageQuestion,
  IconPlus,
  IconScan,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { FileDropzone } from "@/components/FileDropzone";
import {
  MIRAGE_ABSTAIN,
  MIRAGE_LANGUAGES,
  MIRAGE_WEIGHTS,
  buildFormSchema,
  entityName,
  linesToText,
  maskPolygons,
  polygonPoints,
  rankedProbabilities,
  type FormQuestion,
  type MirageBox,
  type MirageLanguage,
  type MirageOptions,
  type MirageResult,
} from "@/lib/mirage";
import { reportProcessedFiles } from "@/lib/reportProcessed";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { MirageWorkerRequest, MirageWorkerResponse } from "@/workers/mirage.worker";
import MirageWorker from "@/workers/mirage.worker.ts?worker";

type Mode = "text" | "describe" | "ask";
type Phase = "download" | "load" | "decode" | "analyze";

type RunResult = { result: MirageResult; width: number; height: number; scaled: boolean; elapsedMs: number };

const MODES: Array<{ id: Mode; label: string; icon: typeof IconScan; blurb: string }> = [
  { id: "text", label: "Extract text", icon: IconScan, blurb: "OCR: read printed text, line by line, with boxes and confidence." },
  {
    id: "describe",
    label: "Describe & detect",
    icon: IconEye,
    blurb: "Scene description, objects with boxes and masks, attributes, and relations.",
  },
  {
    id: "ask",
    label: "Ask questions",
    icon: IconMessageQuestion,
    blurb: "Fill a small form: pick a label, count something, or read a field.",
  },
];

const PRESETS: Array<{ label: string; questions: FormQuestion[] }> = [
  {
    label: "Document check",
    questions: [
      { key: "document_type", kind: "choice", choices: "receipt, invoice, letter, form, id card, screenshot, photo", min: 0, max: 5 },
      { key: "handwritten", kind: "choice", choices: "yes, no", min: 0, max: 5 },
      { key: "title", kind: "text", choices: "", min: 0, max: 5 },
    ],
  },
  {
    label: "Photo facts",
    questions: [
      { key: "setting", kind: "choice", choices: "indoor, outdoor", min: 0, max: 5 },
      { key: "people", kind: "number", choices: "", min: 0, max: 10 },
      { key: "main_subject", kind: "text", choices: "", min: 0, max: 5 },
    ],
  },
  {
    label: "Traffic sign",
    questions: [{ key: "sign", kind: "choice", choices: "stop, yield, speed limit, no entry, pedestrian crossing", min: 0, max: 5 }],
  },
];

const PHASE_COPY: Record<Phase, string> = {
  download: "Downloading Mirage",
  load: "Starting the engine",
  decode: "Reading your image",
  analyze: "Analyzing",
};

const PHASE_ORDER: Phase[] = ["download", "load", "decode", "analyze"];

const MODEL_MB = (MIRAGE_WEIGHTS.size / (1024 * 1024)).toFixed(1);

/** Object colours: distinct hues so overlapping masks stay apart, readable on light and dark themes. */
const OBJECT_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function objectColor(id: number): string {
  return OBJECT_COLORS[(id - 1 + OBJECT_COLORS.length) % OBJECT_COLORS.length];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function percent(value: number | undefined): string {
  return value === undefined ? "–" : `${Math.round(value * 100)}%`;
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function optionsFor(mode: Mode, form?: MirageOptions["form"]): MirageOptions {
  if (mode === "text") return { sections: ["text"], fields: ["bbox", "score"] };
  if (mode === "describe") {
    return {
      sections: ["scene", "objects", "regions", "relations", "events", "reasoning"],
      fields: ["bbox", "score", "mask"],
      mask_format: "polygons",
    };
  }
  return { sections: [], form };
}

export function MirageVisionTool() {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(new Map<string, { resolve: (r: RunResult) => void; reject: (e: Error) => void }>());

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("text");
  const [language, setLanguage] = useState<MirageLanguage>("en");
  const [questions, setQuestions] = useState<FormQuestion[]>(PRESETS[0].questions);
  const [results, setResults] = useState<Partial<Record<Mode, RunResult>>>({});
  const [runningMode, setRunningMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [downloadFraction, setDownloadFraction] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [showMasks, setShowMasks] = useState(true);

  const isRunning = runningMode !== null;

  useEffect(() => {
    const worker = new MirageWorker();
    workerRef.current = worker;
    const pending = pendingRef.current;

    worker.onmessage = (event: MessageEvent<MirageWorkerResponse>) => {
      const data = event.data;
      if (data.type === "progress") {
        // Engine loading is shared, so show its progress whichever request started it.
        setPhase(data.phase);
        if (data.phase === "download") setDownloadFraction(data.fraction ?? 0);
        if (data.phase === "decode" || data.phase === "analyze") setModelReady(true);
        return;
      }
      if (data.type === "ready") {
        setModelReady(true);
        return;
      }
      const request = pending.get(data.requestId);
      if (!request) return;
      pending.delete(data.requestId);
      if (data.type === "error") request.reject(new Error(data.error));
      else request.resolve({ result: data.result, width: data.width, height: data.height, scaled: data.scaled, elapsedMs: data.elapsedMs });
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      for (const request of pending.values()) request.reject(new Error("Cancelled"));
      pending.clear();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const post = (message: MirageWorkerRequest) => workerRef.current?.postMessage(message);

  const run = useCallback(
    async (targetMode: Mode, file: File | null = sourceFile) => {
      const worker = workerRef.current;
      if (!file || !worker || runningMode) return;

      let form: MirageOptions["form"];
      if (targetMode === "ask") {
        const built = buildFormSchema(questions);
        if (built.error !== undefined) {
          setError(built.error);
          return;
        }
        form = built.schema;
      }

      setError(null);
      setRunningMode(targetMode);
      setPhase(null);
      setHovered(null);
      const requestId = String(++requestIdRef.current);
      try {
        const outcome = await new Promise<RunResult>((resolve, reject) => {
          pendingRef.current.set(requestId, { resolve, reject });
          worker.postMessage({
            type: "describe",
            requestId,
            image: file,
            options: optionsFor(targetMode, form),
            language: targetMode === "describe" ? language : undefined,
          } satisfies MirageWorkerRequest);
        });
        setResults((previous) => ({ ...previous, [targetMode]: outcome }));
        setModelReady(true);
        reportProcessedFiles("image-to-text", 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Mirage could not analyze this image. Please try again.");
      } finally {
        setRunningMode(null);
        setPhase(null);
      }
    },
    [language, questions, runningMode, sourceFile],
  );

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const first = Array.from(files)[0];
      if (!first || !first.type.startsWith("image/")) {
        setError("Please use an image file (JPG, PNG, WebP, etc.).");
        return;
      }
      if (runningMode) return;
      setSourceUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return URL.createObjectURL(first);
      });
      setSourceFile(first);
      setResults({});
      setError(null);
      // Reading text is the main job: start it straight away. The other modes wait for a click.
      if (mode === "text") void run("text", first);
      else if (!modelReady) post({ type: "prepare", requestId: `prepare-${++requestIdRef.current}` });
    },
    [mode, modelReady, run, runningMode],
  );

  // Paste a screenshot from the clipboard anywhere on the page.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable=true]")) return;
      const file = Array.from(event.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      event.preventDefault();
      const named = file.name && file.name !== "image.png" ? file : new File([file], `pasted-${Date.now()}.png`, { type: file.type });
      processFiles([named]);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [processFiles]);

  const clearAll = () => {
    setSourceFile(null);
    setSourceUrl(null);
    setResults({});
    setError(null);
    setHovered(null);
  };

  const current = results[mode];
  const basename = sourceFile?.name.replace(/\.[^/.]+$/, "") ?? "image";

  return (
    <div className="w-full max-w-5xl flex-1 flex flex-col items-center mx-auto">
      <div className="rounded-xl shadow-lg mb-6 w-full max-w-5xl border border-theme-border bg-theme-surface px-0 py-4 sm:p-8 space-y-6">
        <ModeTabs mode={mode} disabled={isRunning} onChange={setMode} />

        {!sourceFile ? (
          <FileDropzone
            title="Upload image"
            description="Drop a photo, scan, or screenshot here, choose a file, or paste an image with Ctrl+V."
            buttonLabel="Select Image"
            accept="image/*"
            onFiles={processFiles}
            privacyNote={`Runs on your device with the Mirage model (${MODEL_MB} MB, downloaded once). Your image is never uploaded.`}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-theme-border bg-theme-surface-muted/30 p-4">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-theme-heading truncate">{sourceFile.name}</h3>
                <p className="text-sm text-theme-body">
                  {formatBytes(sourceFile.size)}
                  {current ? ` · ${current.width} × ${current.height}px analyzed${current.scaled ? " (scaled down)" : ""}` : ""}
                </p>
              </div>
              <button type="button" onClick={clearAll} disabled={isRunning} className={cn(tc.btnDanger, "px-3 py-2 text-sm shrink-0")}>
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-theme-border bg-theme-surface-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-theme-muted mb-3">
                  {current && mode !== "ask" ? "Detections" : "Original"}
                </p>
                <ImageOverlay
                  src={sourceUrl ?? ""}
                  mode={mode}
                  run={current}
                  hovered={hovered}
                  onHover={setHovered}
                  minScore={minScore}
                  showMasks={showMasks}
                />
              </div>

              <div className="rounded-lg border border-theme-border bg-theme-surface-muted/30 p-5 flex flex-col gap-5">
                <div>
                  <h4 className="font-semibold text-theme-heading mb-1">{MODES.find((m) => m.id === mode)?.label}</h4>
                  <p className="text-sm text-theme-muted leading-relaxed">{MODES.find((m) => m.id === mode)?.blurb}</p>
                </div>

                {mode === "describe" ? (
                  <label className="flex items-center justify-between gap-3 text-sm text-theme-body">
                    Answer language
                    <select
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as MirageLanguage)}
                      disabled={isRunning}
                      className={cn(tc.field, "px-3 py-1.5 text-sm")}
                    >
                      {MIRAGE_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {mode === "ask" ? <QuestionEditor questions={questions} onChange={setQuestions} disabled={isRunning} /> : null}

                <button
                  type="button"
                  onClick={() => void run(mode)}
                  disabled={isRunning}
                  className={cn(tc.btnPrimary, "w-full px-5 py-3 font-semibold")}
                >
                  <IconSparkles className={cn("w-5 h-5", isRunning && "animate-pulse")} />
                  {isRunning
                    ? "Working…"
                    : current
                      ? "Run again"
                      : mode === "text"
                        ? "Extract text"
                        : mode === "describe"
                          ? "Describe image"
                          : "Ask Mirage"}
                </button>

                <AnimatePresence mode="wait">
                  {isRunning ? <ProgressCard key="progress" phase={phase} downloadFraction={downloadFraction} /> : null}
                </AnimatePresence>

                {!isRunning && !modelReady ? (
                  <p className="text-xs text-theme-muted leading-relaxed">
                    The first run downloads Mirage ({MODEL_MB} MB) from Hugging Face and keeps it in your browser cache. After that it works
                    offline.
                  </p>
                ) : null}
              </div>
            </div>

            {error ? <p className={cn(tc.alertError, "text-sm rounded-lg px-3 py-2")}>{error}</p> : null}

            {current && mode === "text" ? (
              <TextResults
                run={current}
                basename={basename}
                hovered={hovered}
                onHover={setHovered}
                minScore={minScore}
                onMinScore={setMinScore}
              />
            ) : null}
            {current && mode === "describe" ? (
              <DescribeResults
                run={current}
                basename={basename}
                hovered={hovered}
                onHover={setHovered}
                minScore={minScore}
                onMinScore={setMinScore}
                showMasks={showMasks}
                onShowMasks={setShowMasks}
              />
            ) : null}
            {current && mode === "ask" ? <AskResults run={current} basename={basename} /> : null}
          </div>
        )}

        <p className="text-xs text-theme-muted text-center">
          Mirage reads Latin-script text (English, German, French, Spanish, Italian, Dutch, Polish and similar). Small or stylised text can
          be misread. Check important results.
        </p>
      </div>
    </div>
  );
}

function ModeTabs({ mode, disabled, onChange }: { mode: Mode; disabled: boolean; onChange: (mode: Mode) => void }) {
  return (
    <div role="tablist" aria-label="What should Mirage do?" className="flex flex-wrap justify-center gap-1.5 px-4 sm:px-0">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          disabled={disabled}
          onClick={() => onChange(m.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60",
            mode === m.id ? tc.toggleActive : cn(tc.toggleInactive, "bg-theme-surface-muted"),
          )}
        >
          <m.icon className="w-4 h-4" />
          {m.label}
        </button>
      ))}
    </div>
  );
}

function ProgressCard({ phase, downloadFraction }: { phase: Phase | null; downloadFraction: number }) {
  const label =
    phase === "download" ? `${PHASE_COPY.download} (${MODEL_MB} MB, one time only)` : phase ? PHASE_COPY[phase] : "Getting things ready";
  const currentIndex = phase ? PHASE_ORDER.indexOf(phase) : 0;
  const bar = phase === "download" ? downloadFraction * 100 : phase === "analyze" ? 85 : phase ? 40 + currentIndex * 10 : 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative overflow-hidden rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-5"
    >
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
          <div className="absolute inset-1 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          <IconSparkles className="absolute inset-0 m-auto w-5 h-5 text-brand-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-theme-heading">{label}…</p>
          <p className="text-xs text-theme-muted truncate mt-0.5">Running locally in a Web Worker</p>
        </div>
        {phase === "download" ? (
          <span className="text-sm font-semibold text-brand-primary tabular-nums">{Math.round(downloadFraction * 100)}%</span>
        ) : null}
      </div>
      <div className="relative mt-4 h-2 rounded-full bg-theme-surface-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-brand-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(bar, 4)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </motion.div>
  );
}

function ImageOverlay({
  src,
  mode,
  run,
  hovered,
  onHover,
  minScore,
  showMasks,
}: {
  src: string;
  mode: Mode;
  run: RunResult | undefined;
  hovered: string | null;
  onHover: (id: string | null) => void;
  minScore: number;
  showMasks: boolean;
}) {
  const shapes: Array<{ id: string; box: MirageBox; polygons: number[][]; label: string; color: string }> = [];
  if (run && mode === "text") {
    run.result.text?.forEach((line, index) => {
      if (line.bbox && (line.score ?? 1) >= minScore) {
        shapes.push({ id: `t${index}`, box: line.bbox, polygons: [], label: line.string, color: "var(--brand-primary)" });
      }
    });
  } else if (run && mode === "describe") {
    for (const object of run.result.objects ?? []) {
      if (!object.bbox || (object.score ?? 1) < minScore) continue;
      shapes.push({
        id: `o${object.id}`,
        box: object.bbox,
        polygons: showMasks ? maskPolygons(object.mask) : [],
        label: object.name,
        color: objectColor(object.id),
      });
    }
  }

  return (
    <div className="flex justify-center">
      <div className="relative inline-block max-w-full">
        <img src={src} alt="Your image" className="block max-w-full max-h-[28rem] w-auto h-auto rounded-lg" />
        {shapes.length > 0 ? (
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
            {shapes.map((shape) => {
              const active = hovered === shape.id;
              const dim = hovered !== null && !active;
              const [x1, y1, x2, y2] = shape.box;
              return (
                <g
                  key={shape.id}
                  onMouseEnter={() => onHover(shape.id)}
                  onMouseLeave={() => onHover(null)}
                  style={{ opacity: dim ? 0.25 : 1, transition: "opacity 150ms" }}
                >
                  <title>{shape.label}</title>
                  {shape.polygons.map((polygon, i) => (
                    <polygon key={i} points={polygonPoints(polygon)} fill={shape.color} fillOpacity={active ? 0.45 : 0.16} stroke="none" />
                  ))}
                  <rect
                    x={x1}
                    y={y1}
                    width={Math.max(x2 - x1, 1)}
                    height={Math.max(y2 - y1, 1)}
                    fill={shape.color}
                    fillOpacity={active && shape.polygons.length === 0 ? 0.18 : 0}
                    stroke={shape.color}
                    strokeWidth={active ? 3 : 1.5}
                    vectorEffect="non-scaling-stroke"
                    rx={4}
                  />
                </g>
              );
            })}
          </svg>
        ) : null}
      </div>
    </div>
  );
}

function ResultPanel({ title, meta, actions, children }: { title: string; meta: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-theme-border bg-theme-surface-muted/30 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-theme-heading">{title}</h4>
          <p className="text-sm text-theme-muted mt-0.5">{meta}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

function ScoreFilter({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-theme-body">
      <span className="shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={0.9}
        step={0.05}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="flex-1 accent-[var(--brand-primary)]"
      />
      <span className="w-10 text-right tabular-nums text-theme-muted">{percent(value)}</span>
    </label>
  );
}

function ScorePill({ score }: { score: number | undefined }) {
  if (score === undefined) return null;
  const tone = score >= 0.5 ? "text-[var(--theme-diff-added-text)]" : score >= 0.35 ? "text-theme-body" : "text-theme-muted";
  return <span className={cn("text-xs tabular-nums shrink-0", tone)}>{percent(score)}</span>;
}

function useCopy(): [string | null, (key: string, text: string) => void] {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      window.setTimeout(() => setCopied((value) => (value === key ? null : value)), 1500);
    });
  };
  return [copied, copy];
}

function JsonButton({ run, basename }: { run: RunResult; basename: string }) {
  return (
    <button
      type="button"
      onClick={() => download(`${basename}-mirage.json`, JSON.stringify(run.result, null, 2), "application/json")}
      className={cn(tc.btnSecondary, "px-3 py-2 text-sm")}
    >
      <IconDownload className="w-4 h-4" />
      JSON
    </button>
  );
}

function RawJson({ run }: { run: RunResult }) {
  return (
    <details className="group">
      <summary className="cursor-pointer text-sm font-medium text-theme-muted hover:text-theme-heading">Raw Mirage output</summary>
      <pre className={cn(tc.code, "mt-2 max-h-80 overflow-auto rounded-lg p-3 text-xs")}>{JSON.stringify(run.result, null, 2)}</pre>
    </details>
  );
}

function TextResults({
  run,
  basename,
  hovered,
  onHover,
  minScore,
  onMinScore,
}: {
  run: RunResult;
  basename: string;
  hovered: string | null;
  onHover: (id: string | null) => void;
  minScore: number;
  onMinScore: (value: number) => void;
}) {
  const [copied, copy] = useCopy();
  const lines = useMemo(
    () => (run.result.text ?? []).map((line, index) => ({ ...line, id: `t${index}` })).filter((line) => (line.score ?? 1) >= minScore),
    [run, minScore],
  );
  const extracted = useMemo(() => linesToText(lines), [lines]);
  const [text, setText] = useState(extracted);
  useEffect(() => setText(extracted), [extracted]);

  const meta = `${lines.length} ${lines.length === 1 ? "line" : "lines"} · ${(run.elapsedMs / 1000).toFixed(1)} s on this device`;

  return (
    <ResultPanel
      title={lines.length ? "Text extracted" : "No text found"}
      meta={meta}
      actions={
        <>
          <button type="button" onClick={() => copy("all", text)} disabled={!text} className={cn(tc.btnPrimary, "px-3 py-2 text-sm")}>
            <IconCopy className="w-4 h-4" />
            {copied === "all" ? "Copied" : "Copy text"}
          </button>
          <button
            type="button"
            onClick={() => download(`${basename}.txt`, text, "text/plain;charset=utf-8")}
            disabled={!text}
            className={cn(tc.btnSecondary, "px-3 py-2 text-sm")}
          >
            <IconDownload className="w-4 h-4" />
            TXT
          </button>
          <JsonButton run={run} basename={basename} />
        </>
      }
    >
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={Math.min(Math.max(lines.length + 1, 4), 14)}
        spellCheck={false}
        aria-label="Extracted text, editable"
        className={cn(tc.field, "w-full p-3 font-mono text-sm leading-relaxed resize-y")}
        placeholder="Mirage did not find readable text in this image."
      />
      <p className="text-xs text-theme-muted -mt-2">Rows are put in reading order. You can fix mistakes here before copying.</p>

      {run.result.text?.length ? (
        <>
          <ScoreFilter value={minScore} onChange={onMinScore} label="Hide lines below" />
          <ul className="divide-y divide-theme-border rounded-lg border border-theme-border bg-theme-surface">
            {lines.map((line) => (
              <li
                key={line.id}
                onMouseEnter={() => onHover(line.id)}
                onMouseLeave={() => onHover(null)}
                className={cn("flex items-center gap-3 px-3 py-2 text-sm transition-colors", hovered === line.id && "bg-brand-primary/10")}
              >
                <span className="flex-1 min-w-0 truncate text-theme-heading font-mono">{line.string}</span>
                <ScorePill score={line.score} />
                <button
                  type="button"
                  onClick={() => copy(line.id, line.string)}
                  className="text-theme-muted hover:text-brand-primary"
                  aria-label={`Copy "${line.string}"`}
                >
                  <IconClipboardText className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <RawJson run={run} />
    </ResultPanel>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-theme-border bg-theme-surface px-2 py-0.5 text-xs text-theme-body">
      {children}
    </span>
  );
}

function DescribeResults({
  run,
  basename,
  hovered,
  onHover,
  minScore,
  onMinScore,
  showMasks,
  onShowMasks,
}: {
  run: RunResult;
  basename: string;
  hovered: string | null;
  onHover: (id: string | null) => void;
  minScore: number;
  onMinScore: (value: number) => void;
  showMasks: boolean;
  onShowMasks: (value: boolean) => void;
}) {
  const { result } = run;
  const objects = (result.objects ?? []).filter((o) => (o.score ?? 1) >= minScore);
  const reasoning = result.reasoning
    ?.split("|")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("lang:"));
  const events = (result.events ?? []).map((event) => (typeof event === "string" ? event : JSON.stringify(event)));

  return (
    <ResultPanel
      title="Image description"
      meta={`${objects.length} ${objects.length === 1 ? "object" : "objects"} · ${(run.elapsedMs / 1000).toFixed(1)} s on this device`}
      actions={<JsonButton run={run} basename={basename} />}
    >
      {result.scene && Object.keys(result.scene).length ? (
        <section className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-theme-muted">Scene</h5>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {Object.entries(result.scene).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="text-theme-muted capitalize">{key.replace(/_/g, " ")}</dt>
                <dd className="text-theme-heading">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {result.objects?.length ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-theme-muted">Objects</h5>
            <label className="flex items-center gap-2 text-sm text-theme-body">
              <input
                type="checkbox"
                checked={showMasks}
                onChange={(event) => onShowMasks(event.target.checked)}
                className="accent-[var(--brand-primary)]"
              />
              Show masks
            </label>
          </div>
          <ScoreFilter value={minScore} onChange={onMinScore} label="Hide below" />
          <ul className="divide-y divide-theme-border rounded-lg border border-theme-border bg-theme-surface">
            {objects.map((object) => (
              <li
                key={object.id}
                onMouseEnter={() => onHover(`o${object.id}`)}
                onMouseLeave={() => onHover(null)}
                className={cn(
                  "flex flex-wrap items-center gap-2 px-3 py-2 text-sm transition-colors",
                  hovered === `o${object.id}` && "bg-brand-primary/10",
                )}
              >
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: objectColor(object.id) }} aria-hidden="true" />
                <span className="font-medium text-theme-heading">{object.name}</span>
                {object.position ? <span className="text-theme-muted">{object.position}</span> : null}
                <span className="flex flex-wrap gap-1">
                  {Object.entries(object.description ?? {}).map(([key, value]) => (
                    <Chip key={key}>
                      {key}: {value}
                    </Chip>
                  ))}
                </span>
                <span className="ml-auto">
                  <ScorePill score={object.score} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result.regions?.length ? (
        <section className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-theme-muted">Regions</h5>
          <div className="flex flex-wrap gap-1.5">
            {result.regions.map((region) => (
              <Chip key={region.id}>
                {region.name}
                {region.position ? ` · ${region.position}` : ""}
                {Object.values(region.description ?? {}).length ? ` · ${Object.values(region.description ?? {}).join(", ")}` : ""}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      {result.relations?.length ? (
        <section className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-theme-muted">Relations</h5>
          <ul className="space-y-1 text-sm text-theme-body">
            {result.relations.map((relation, index) => (
              <li key={index}>
                <span className="text-theme-heading">{entityName(result, relation.subject)}</span>{" "}
                <span className="text-brand-primary">{relation.predicate.replace(/_/g, " ")}</span>{" "}
                <span className="text-theme-heading">{entityName(result, relation.object)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {events.length ? (
        <section className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-theme-muted">Events</h5>
          <ul className="list-disc pl-5 space-y-1 text-sm text-theme-body">
            {events.map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {reasoning?.length ? (
        <section className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-theme-muted">Mirage's reasoning</h5>
          <ul className="list-disc pl-5 space-y-1 text-sm text-theme-body">
            {reasoning.map((part, index) => (
              <li key={index}>{part}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <RawJson run={run} />
    </ResultPanel>
  );
}

function QuestionEditor({
  questions,
  onChange,
  disabled,
}: {
  questions: FormQuestion[];
  onChange: (questions: FormQuestion[]) => void;
  disabled: boolean;
}) {
  const update = (index: number, patch: Partial<FormQuestion>) =>
    onChange(questions.map((question, i) => (i === index ? { ...question, ...patch } : question)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider mr-1">Presets</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset.questions)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold", tc.toggleInactive, "bg-theme-surface-muted")}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {questions.map((question, index) => (
          <li key={index} className="rounded-lg border border-theme-border bg-theme-surface p-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={question.key}
                onChange={(event) => update(index, { key: event.target.value })}
                disabled={disabled}
                placeholder="name, e.g. document_type"
                aria-label={`Question ${index + 1} name`}
                className={cn(tc.field, "min-w-0 flex-1 px-2.5 py-1.5 text-sm font-mono")}
              />
              <select
                value={question.kind}
                onChange={(event) => update(index, { kind: event.target.value as FormQuestion["kind"] })}
                disabled={disabled}
                aria-label={`Question ${index + 1} answer type`}
                className={cn(tc.field, "px-2 py-1.5 text-sm")}
              >
                <option value="choice">Choice</option>
                <option value="number">Number</option>
                <option value="text">Short text</option>
              </select>
              <button
                type="button"
                onClick={() => onChange(questions.filter((_, i) => i !== index))}
                disabled={disabled}
                aria-label={`Delete question ${index + 1}`}
                className="text-theme-muted hover:text-[var(--theme-diff-removed-text)] px-1"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
            {question.kind === "choice" ? (
              <input
                value={question.choices}
                onChange={(event) => update(index, { choices: event.target.value })}
                disabled={disabled}
                placeholder="choices, separated by commas"
                aria-label={`Question ${index + 1} choices`}
                className={cn(tc.field, "w-full px-2.5 py-1.5 text-sm")}
              />
            ) : null}
            {question.kind === "number" ? (
              <div className="flex items-center gap-2 text-sm text-theme-body">
                From
                <input
                  type="number"
                  min={0}
                  value={question.min}
                  onChange={(event) => update(index, { min: Number(event.target.value) })}
                  disabled={disabled}
                  aria-label={`Question ${index + 1} minimum`}
                  className={cn(tc.field, "w-20 px-2 py-1 text-sm")}
                />
                to
                <input
                  type="number"
                  min={0}
                  value={question.max}
                  onChange={(event) => update(index, { max: Number(event.target.value) })}
                  disabled={disabled}
                  aria-label={`Question ${index + 1} maximum`}
                  className={cn(tc.field, "w-20 px-2 py-1 text-sm")}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange([...questions, { key: "", kind: "choice", choices: "", min: 0, max: 10 }])}
        className={cn(tc.btnSecondary, "px-3 py-1.5 text-sm")}
      >
        <IconPlus className="w-4 h-4" />
        Add question
      </button>
    </div>
  );
}

function AskResults({ run, basename }: { run: RunResult; basename: string }) {
  const form = run.result.form ?? {};

  return (
    <ResultPanel
      title="Answers"
      meta={`${Object.keys(form).length} ${Object.keys(form).length === 1 ? "answer" : "answers"} · ${(run.elapsedMs / 1000).toFixed(1)} s on this device`}
      actions={<JsonButton run={run} basename={basename} />}
    >
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(form).map(([key, answer]) => {
          const ranked = rankedProbabilities(answer.probabilities).slice(0, 5);
          return (
            <li key={key} className="rounded-lg border border-theme-border bg-theme-surface p-4 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-mono text-theme-muted">{key}</span>
                {answer.probability !== undefined ? <ScorePill score={answer.probability} /> : null}
              </div>
              <p className="text-lg font-semibold text-theme-heading break-words">
                {answer.value === null || answer.value === MIRAGE_ABSTAIN
                  ? answer.probabilities
                    ? "None of these"
                    : "No answer"
                  : String(answer.value)}
              </p>
              {ranked.length ? (
                <ul className="space-y-1.5">
                  {ranked.map(([label, probability]) => (
                    <li key={label} className="text-xs">
                      <div className="flex justify-between gap-2 text-theme-body">
                        <span>{label === MIRAGE_ABSTAIN ? "none of these" : label}</span>
                        <span className="tabular-nums text-theme-muted">{percent(probability)}</span>
                      </div>
                      <div className="mt-0.5 h-1.5 rounded-full bg-theme-surface-muted overflow-hidden">
                        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${Math.max(probability * 100, 1)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <RawJson run={run} />
    </ResultPanel>
  );
}
