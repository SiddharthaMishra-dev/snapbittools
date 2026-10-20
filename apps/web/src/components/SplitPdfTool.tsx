import { IconCircleX, IconFileTypePdf, IconScissors } from "@tabler/icons-react";
import JSZip from "jszip";
import { useState } from "react";

import { FileDropzone } from "@/components/FileDropzone";
import { downloadBlob, formatBytes, isPdfFile, pdfBaseName, readPdfPageCount, splitPdfAt, splitPdfIntoPages } from "@/lib/pdfPages";
import { reportProcessedFiles } from "@/lib/reportProcessed";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type Status = "idle" | "reading" | "ready" | "working" | "error";

export function SplitPdfTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [afterPage, setAfterPage] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const working = status === "working" || status === "reading";

  const clearAll = () => {
    setFileName(null);
    setFileSize(0);
    setPdfData(null);
    setPageCount(0);
    setAfterPage(1);
    setStatus("idle");
    setError(null);
    setProgress({ current: 0, total: 0 });
  };

  const acceptFile = async (list: FileList | File[]) => {
    const file = Array.from(list)[0];
    if (!file) return;
    if (!isPdfFile(file)) {
      setError("Please upload a PDF file.");
      return;
    }

    setError(null);
    setStatus("reading");
    setFileName(file.name);
    setFileSize(file.size);
    setPdfData(null);
    setPageCount(0);

    try {
      const data = await file.arrayBuffer();
      const count = await readPdfPageCount(data);
      if (count < 1) throw new Error("This PDF has no pages.");
      setPdfData(data);
      setPageCount(count);
      setAfterPage(Math.max(1, Math.floor(count / 2)));
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setPdfData(null);
      setError(err instanceof Error ? err.message : "This PDF could not be read.");
    }
  };

  const downloadZip = async (entries: { name: string; bytes: Uint8Array }[], zipName: string) => {
    const zip = new JSZip();
    for (const entry of entries) zip.file(entry.name, entry.bytes);
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, zipName);
    reportProcessedFiles("split-pdf", 1);
  };

  const splitEveryPage = async () => {
    if (!pdfData || !fileName || working || pageCount < 2) return;
    setStatus("working");
    setError(null);
    setProgress({ current: 0, total: pageCount });

    try {
      const parts = await splitPdfIntoPages(pdfData, (current, total) => setProgress({ current, total }));
      const base = pdfBaseName(fileName);
      const width = String(parts.length).length;
      await downloadZip(
        parts.map((bytes, index) => ({
          name: `${base}-page-${String(index + 1).padStart(width, "0")}.pdf`,
          bytes,
        })),
        `${base}-pages.zip`,
      );
      setStatus("ready");
    } catch (err) {
      setStatus("ready");
      setError(err instanceof Error ? err.message : "This PDF could not be split.");
    }
  };

  const splitInTwo = async () => {
    if (!pdfData || !fileName || working || pageCount < 2) return;
    setStatus("working");
    setError(null);
    setProgress({ current: 0, total: 2 });

    try {
      const [first, second] = await splitPdfAt(pdfData, afterPage);
      const base = pdfBaseName(fileName);
      await downloadZip(
        [
          { name: `${base}-part-1.pdf`, bytes: first },
          { name: `${base}-part-2.pdf`, bytes: second },
        ],
        `${base}-split.zip`,
      );
      setStatus("ready");
    } catch (err) {
      setStatus("ready");
      setError(err instanceof Error ? err.message : "This PDF could not be split.");
    }
  };

  const canSplit = (status === "ready" || status === "working") && pageCount >= 2 && pdfData !== null;

  return (
    <div className="w-full max-w-5xl flex-1 flex flex-col items-center mx-auto">
      <div className="rounded-xl shadow-lg mb-6 w-full max-w-5xl border border-theme-border bg-theme-surface px-0 py-4 sm:p-8">
        {!fileName ? (
          <FileDropzone
            title="Upload PDF"
            description="Drag and drop a PDF here. Split it into one file per page, or into two PDFs, without uploading."
            buttonLabel="Select PDF"
            accept="application/pdf,.pdf"
            onFiles={acceptFile}
          />
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
                    {pageCount > 0 ? ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}` : status === "reading" ? " · Reading…" : ""}
                  </p>
                </div>
              </div>
              <button type="button" onClick={clearAll} disabled={working} className={cn(tc.btnDanger, "px-3 py-2 text-sm shrink-0")}>
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            {error && <div className={cn(tc.alertError, "rounded-lg px-4 py-3 text-sm")}>{error}</div>}

            {pageCount === 1 && status !== "reading" && (
              <p className="text-sm text-theme-body">This PDF has only one page, so there is nothing to split.</p>
            )}

            {canSplit && (
              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-lg border border-theme-border p-4 space-y-3">
                  <h3 className="font-semibold text-theme-heading">Every page</h3>
                  <p className="text-sm text-theme-body">Download a ZIP with one PDF for each of the {pageCount} pages.</p>
                  <button type="button" onClick={splitEveryPage} disabled={status === "working"} className={cn(tc.btnPrimary, "px-5 py-2")}>
                    <IconScissors className="w-4 h-4" />
                    Download pages
                  </button>
                </section>

                <section className="rounded-lg border border-theme-border p-4 space-y-3">
                  <h3 className="font-semibold text-theme-heading">Two PDFs</h3>
                  <p className="text-sm text-theme-body">
                    Part 1 is pages 1–{afterPage}. Part 2 is pages {afterPage + 1}–{pageCount}.
                  </p>
                  <label className="block text-sm text-theme-body">
                    Split after page {afterPage}
                    <input
                      type="range"
                      min={1}
                      max={pageCount - 1}
                      value={afterPage}
                      onChange={(event) => setAfterPage(Number(event.target.value))}
                      disabled={status === "working"}
                      className="mt-2 w-full accent-brand-primary"
                    />
                  </label>
                  <button type="button" onClick={splitInTwo} disabled={status === "working"} className={cn(tc.btnPrimary, "px-5 py-2")}>
                    <IconScissors className="w-4 h-4" />
                    Download two PDFs
                  </button>
                </section>
              </div>
            )}

            {status === "working" && (
              <div className="space-y-2">
                <p className="text-sm text-theme-body">
                  {progress.current > 0 ? `Splitting ${progress.current} of ${progress.total}…` : "Splitting…"}
                </p>
                <div className="h-1.5 rounded-full bg-theme-surface-muted overflow-hidden">
                  <div
                    className="h-full bg-brand-primary transition-[width]"
                    style={{ width: `${progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
