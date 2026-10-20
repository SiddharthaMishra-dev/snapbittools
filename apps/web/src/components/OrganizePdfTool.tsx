import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleX,
  IconDownload,
  IconFileTypePdf,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { FileDropzone } from "@/components/FileDropzone";
import { downloadBlob, formatBytes, isPdfFile, pdfBaseName, pdfBytesToBlob, readPdfPageCount, rebuildPdfPages } from "@/lib/pdfPages";
import { renderPdfPagePreviews } from "@/lib/pdfThumbnails";
import { reportProcessedFiles } from "@/lib/reportProcessed";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type PageCard = {
  id: string;
  sourceIndex: number;
  preview: string | null;
};

type Status = "idle" | "reading" | "ready" | "saving";

function buildPages(count: number, previews: Map<number, string>): PageCard[] {
  return Array.from({ length: count }, (_, sourceIndex) => ({
    id: `page-${sourceIndex}`,
    sourceIndex,
    preview: previews.get(sourceIndex) ?? null,
  }));
}

export function OrganizePdfTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageCard[]>([]);
  const [originalCount, setOriginalCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewNote, setPreviewNote] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
  const job = useRef(0);
  const previews = useRef(new Map<number, string>());
  const previewUrls = useRef<string[]>([]);

  const revokePreviews = () => {
    for (const url of previewUrls.current) URL.revokeObjectURL(url);
    previewUrls.current = [];
    previews.current.clear();
  };

  useEffect(() => {
    return () => {
      job.current += 1;
      revokePreviews();
    };
  }, []);

  const clearAll = () => {
    job.current += 1;
    revokePreviews();
    setFileName(null);
    setFileSize(0);
    setPdfData(null);
    setPages([]);
    setOriginalCount(0);
    setStatus("idle");
    setError(null);
    setPreviewNote(null);
  };

  const acceptFile = async (list: FileList | File[]) => {
    const file = Array.from(list)[0];
    if (!file) return;
    if (!isPdfFile(file)) {
      setError("Please upload a PDF file.");
      return;
    }

    job.current += 1;
    const token = job.current;
    revokePreviews();
    setError(null);
    setPreviewNote(null);
    setStatus("reading");
    setFileName(file.name);
    setFileSize(file.size);
    setPdfData(null);
    setPages([]);

    try {
      const data = await file.arrayBuffer();
      const count = await readPdfPageCount(data);
      if (job.current !== token) return;
      if (count < 1) throw new Error("This PDF has no pages.");

      setPdfData(data);
      setOriginalCount(count);
      setPages(buildPages(count, previews.current));
      setStatus("ready");

      void renderPdfPagePreviews(
        data,
        (index, blob) => {
          if (job.current !== token) return;
          const url = URL.createObjectURL(blob);
          previewUrls.current.push(url);
          previews.current.set(index, url);
          setPages((current) => current.map((page) => (page.sourceIndex === index ? { ...page, preview: url } : page)));
        },
        () => job.current === token,
      ).catch((err: unknown) => {
        if (job.current !== token) return;
        setPreviewNote(err instanceof Error ? err.message : "Page previews could not be loaded. You can still reorder by page number.");
      });
    } catch (err) {
      if (job.current !== token) return;
      setStatus("idle");
      setFileName(null);
      setError(err instanceof Error ? err.message : "This PDF could not be read.");
    }
  };

  const moveTo = (fromId: string | null, toId: string) => {
    if (!fromId || fromId === toId) return;
    setPages((current) => {
      const from = current.findIndex((page) => page.id === fromId);
      const to = current.findIndex((page) => page.id === toId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const moveBy = (id: string, direction: -1 | 1) => {
    setPages((current) => {
      const index = current.findIndex((page) => page.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const deletePage = (id: string) => {
    setPages((current) => (current.length <= 1 ? current : current.filter((page) => page.id !== id)));
  };

  const resetPages = () => {
    setPages(buildPages(originalCount, previews.current));
    setError(null);
  };

  const download = async () => {
    if (!pdfData || !fileName || pages.length < 1 || status === "saving") return;
    setStatus("saving");
    setError(null);
    try {
      const bytes = await rebuildPdfPages(
        pdfData,
        pages.map((page) => page.sourceIndex),
      );
      downloadBlob(pdfBytesToBlob(bytes), `${pdfBaseName(fileName)}-reordered.pdf`);
      reportProcessedFiles("reorder-pdf", 1);
      setStatus("ready");
    } catch (err) {
      setStatus("ready");
      setError(err instanceof Error ? err.message : "This PDF could not be saved.");
    }
  };

  const removed = Math.max(0, originalCount - pages.length);
  const changed = removed > 0 || pages.some((page, index) => page.sourceIndex !== index);

  return (
    <div className="w-full max-w-5xl flex-1 flex flex-col items-center mx-auto">
      <div className="rounded-xl shadow-lg mb-6 w-full max-w-5xl border border-theme-border bg-theme-surface px-0 py-4 sm:p-8">
        {!fileName ? (
          <div className="space-y-4">
            {error && <div className={cn(tc.alertError, "rounded-lg px-4 py-3 text-sm mx-4 sm:mx-0")}>{error}</div>}
            <FileDropzone
              title="Upload PDF"
              description="Drag and drop a PDF here. Reorder pages and delete the ones you don’t need — the file stays on your device."
              buttonLabel="Select PDF"
              accept="application/pdf,.pdf"
              onFiles={acceptFile}
            />
          </div>
        ) : (
          <div className="space-y-6 px-4 sm:px-0">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-theme-border bg-theme-surface-muted/30 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/15 flex items-center justify-center shrink-0">
                  <IconFileTypePdf className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-theme-heading truncate">{fileName}</h3>
                  <p className="text-sm text-theme-body">
                    {formatBytes(fileSize)}
                    {originalCount > 0 ? ` · ${pages.length} of ${originalCount} pages kept` : " · Reading…"}
                    {removed > 0 ? ` · ${removed} removed` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearAll}
                disabled={status === "saving"}
                className={cn(tc.btnDanger, "px-3 py-2 text-sm shrink-0")}
              >
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            {error && <div className={cn(tc.alertError, "rounded-lg px-4 py-3 text-sm")}>{error}</div>}
            {previewNote && <p className="text-sm text-theme-body">{previewNote}</p>}

            {status !== "reading" && pages.length > 0 && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-theme-body">
                    Page labels are from the original file. Drag a preview, or use the arrows, to change the order.
                  </p>
                  <div className="flex gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={resetPages}
                      disabled={!changed || status === "saving"}
                      className={cn(tc.btnSecondary, "px-4 py-2 text-sm")}
                    >
                      Reset
                    </button>
                    <button type="button" onClick={download} disabled={status === "saving"} className={cn(tc.btnPrimary, "px-5 py-2")}>
                      {status === "saving" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <IconDownload className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pages.map((page, index) => (
                    <article
                      key={page.id}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setOverId(page.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        moveTo(dragId.current, page.id);
                        dragId.current = null;
                        setOverId(null);
                      }}
                      className={cn(
                        "relative flex flex-col rounded-lg border bg-theme-surface overflow-hidden",
                        overId === page.id ? "border-brand-primary ring-2 ring-brand-primary/30" : "border-theme-border",
                      )}
                    >
                      <div
                        draggable={status !== "saving"}
                        onDragStart={() => {
                          dragId.current = page.id;
                        }}
                        onDragEnd={() => {
                          dragId.current = null;
                          setOverId(null);
                        }}
                        className="aspect-[3/4] bg-theme-surface-muted cursor-grab active:cursor-grabbing flex items-center justify-center"
                      >
                        {page.preview ? (
                          <img src={page.preview} alt="" className="h-full w-full object-contain pointer-events-none" />
                        ) : (
                          <div className="h-full w-full animate-pulse bg-theme-surface-muted" />
                        )}
                      </div>
                      <IconGripVertical className="absolute left-2 top-2 w-4 h-4 text-theme-muted pointer-events-none" aria-hidden />
                      <button
                        type="button"
                        onClick={() => deletePage(page.id)}
                        disabled={pages.length < 2 || status === "saving"}
                        aria-label={`Delete original page ${page.sourceIndex + 1}`}
                        className={cn(tc.btnDanger, "absolute right-2 top-2 p-1.5 rounded-full")}
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center justify-between gap-1 px-1.5 py-2">
                        <button
                          type="button"
                          onClick={() => moveBy(page.id, -1)}
                          disabled={index === 0 || status === "saving"}
                          aria-label={`Move page ${page.sourceIndex + 1} earlier`}
                          className={cn(tc.btnSecondary, "p-1.5")}
                        >
                          <IconChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="text-center min-w-0">
                          <p className="text-xs font-semibold text-theme-heading truncate">Page {page.sourceIndex + 1}</p>
                          <p className="text-[10px] text-theme-muted">Position {index + 1}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => moveBy(page.id, 1)}
                          disabled={index === pages.length - 1 || status === "saving"}
                          aria-label={`Move page ${page.sourceIndex + 1} later`}
                          className={cn(tc.btnSecondary, "p-1.5")}
                        >
                          <IconChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
