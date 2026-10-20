import { IconCircleX, IconFileTypePdf, IconStack2 } from "@tabler/icons-react";
import { Reorder } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { FileDropzone } from "@/components/FileDropzone";
import { downloadBlob, formatBytes, isPdfFile, mergePdfBuffers, pdfBaseName, pdfBytesToBlob, readPdfPageCount } from "@/lib/pdfPages";
import { reportProcessedFiles } from "@/lib/reportProcessed";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type MergeFile = {
  id: string;
  name: string;
  size: number;
  data: ArrayBuffer;
};

type FileRead = { state: "loading" } | { state: "ready"; pages: number } | { state: "error"; message: string };

export function MergePdfTool() {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [reads, setReads] = useState<Record<string, FileRead>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const started = useRef(new Set<string>());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    for (const file of files) {
      if (started.current.has(file.id)) continue;
      started.current.add(file.id);
      void readPdfPageCount(file.data).then(
        (pages) => {
          if (!mounted.current) return;
          setReads((current) => ({
            ...current,
            [file.id]: pages > 0 ? { state: "ready", pages } : { state: "error", message: "This PDF has no pages." },
          }));
        },
        (err: unknown) => {
          if (!mounted.current) return;
          setReads((current) => ({
            ...current,
            [file.id]: { state: "error", message: err instanceof Error ? err.message : "Could not read this PDF." },
          }));
        },
      );
    }
  }, [files]);

  const addFiles = async (list: FileList | File[]) => {
    const incoming = Array.from(list);
    const pdfs = incoming.filter(isPdfFile);
    const skipped = incoming.length - pdfs.length;
    setNotice(skipped > 0 ? `Skipped ${skipped} ${skipped === 1 ? "file that isn’t" : "files that aren’t"} a PDF.` : null);
    setError(null);
    if (pdfs.length === 0) return;

    const next: MergeFile[] = [];
    for (const file of pdfs) {
      const data = await file.arrayBuffer();
      next.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        data,
      });
    }
    setFiles((current) => [...current, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
    setError(null);
  };

  const clearAll = () => {
    setFiles([]);
    setReads({});
    started.current.clear();
    setNotice(null);
    setError(null);
    setProgress({ current: 0, total: 0 });
  };

  const readyFiles = files.filter((file) => reads[file.id]?.state === "ready");
  const pending = files.some((file) => !reads[file.id] || reads[file.id].state === "loading");
  const broken = files.filter((file) => reads[file.id]?.state === "error");
  const totalPages = readyFiles.reduce((sum, file) => {
    const read = reads[file.id];
    return sum + (read?.state === "ready" ? read.pages : 0);
  }, 0);
  const canMerge = files.length >= 2 && !pending && broken.length === 0 && !merging;

  const merge = async () => {
    if (!canMerge) return;
    setMerging(true);
    setError(null);
    setProgress({ current: 0, total: files.length });

    try {
      const bytes = await mergePdfBuffers(
        files.map((file) => file.data),
        (current, total) => setProgress({ current, total }),
      );
      const name = `${pdfBaseName(files[0].name)}-merged.pdf`;
      downloadBlob(pdfBytesToBlob(bytes), name);
      reportProcessedFiles("merge-pdf", files.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "These PDFs could not be merged.");
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="w-full max-w-5xl flex-1 flex flex-col items-center mx-auto">
      <div className="rounded-xl shadow-lg mb-6 w-full max-w-5xl border border-theme-border bg-theme-surface px-0 py-4 sm:p-8">
        <FileDropzone
          title="Upload PDFs"
          description="Drag and drop two or more PDFs here. They are merged in your browser, in the order you set."
          buttonLabel="Select PDFs"
          accept="application/pdf,.pdf"
          multiple
          disabled={merging}
          onFiles={addFiles}
          className={files.length > 0 ? "mb-6 p-8" : undefined}
        />

        {files.length > 0 && (
          <div className="space-y-6 px-4 sm:px-0">
            {notice && <p className="text-sm text-theme-body">{notice}</p>}
            {error && <div className={cn(tc.alertError, "rounded-lg px-4 py-3 text-sm")}>{error}</div>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-theme-surface/50 p-4 rounded-lg border border-theme-border">
              <div>
                <p className="text-theme-heading font-medium">
                  {files.length} {files.length === 1 ? "PDF" : "PDFs"}
                  {totalPages > 0 ? ` · ${totalPages} ${totalPages === 1 ? "page" : "pages"}` : ""}
                </p>
                <p className="text-xs text-theme-muted mt-1">
                  {files.length < 2 ? "Add at least one more PDF." : "Drag to set the order. Text and images stay in the PDF."}
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={clearAll} disabled={merging} className={cn(tc.btnDanger, "px-4 py-2 text-sm")}>
                  <IconCircleX className="w-4 h-4" />
                  Clear
                </button>
                <button type="button" onClick={merge} disabled={!canMerge} className={cn(tc.btnPrimary, "px-6 py-2 shadow-md")}>
                  {merging ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {progress.current > 0 ? `Merging ${progress.current} of ${progress.total}` : "Merging…"}
                    </>
                  ) : (
                    <>
                      <IconStack2 className="w-5 h-5" />
                      Merge PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {broken.length > 0 && (
              <div className={cn(tc.alertError, "rounded-lg px-4 py-3 text-sm")}>Remove the PDF that could not be read before merging.</div>
            )}

            <div className="bg-theme-surface/30 rounded-xl p-4 border border-theme-border">
              <p className="text-theme-muted text-xs mb-3 text-center uppercase tracking-wider font-semibold">Drag to reorder</p>
              <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-2">
                {files.map((file) => {
                  const read = reads[file.id];
                  return (
                    <Reorder.Item
                      key={file.id}
                      value={file}
                      className="bg-theme-surface rounded-lg border border-theme-border p-3 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm"
                    >
                      <div className="w-6 flex flex-col items-center justify-center gap-1 text-theme-muted" aria-hidden>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <div className="w-1 h-1 rounded-full bg-current" />
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-brand-primary/15 flex items-center justify-center shrink-0">
                        <IconFileTypePdf className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-theme-heading text-sm font-medium truncate">{file.name}</p>
                        <p className="text-theme-muted text-xs mt-0.5">
                          {formatBytes(file.size)}
                          {read?.state === "ready" ? ` · ${read.pages} ${read.pages === 1 ? "page" : "pages"}` : ""}
                          {read?.state === "loading" || !read ? " · Reading…" : ""}
                          {read?.state === "error" ? ` · ${read.message}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        disabled={merging}
                        className={cn(tc.btnDanger, "p-2 rounded-full")}
                        aria-label={`Remove ${file.name}`}
                      >
                        <IconCircleX className="w-5 h-5" />
                      </button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
