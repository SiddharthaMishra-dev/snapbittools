import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { IconCheck, IconCopy, IconDownload, IconBraces, IconTrash, IconAlertCircle, IconTable, IconUpload } from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";

import { getSeoMetadata } from "@/lib/seo";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";

const faqs = [
  {
    question: "Is my data secure when converting CSV to JSON?",
    answer:
      "Yes, absolutely secure. The conversion process is entirely client-side, meaning your CSV data never leaves your browser. No servers are involved, and no data is stored after your session ends.",
  },
  {
    question: "How does the tool handle special characters and quoted fields?",
    answer:
      "The parser correctly handles CSV complexity including quoted fields containing newlines, commas, escaped quotes, and special Unicode characters. Headers are auto-detected from the first row and used as JSON object keys.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "The limit depends on your browser's memory, as processing happens locally. Most CSV files up to 50MB work efficiently. Extremely large files (100MB+) may experience slight performance degradation.",
  },
  {
    question: "What happens to empty fields or inconsistent rows?",
    answer:
      "Empty fields are preserved in the JSON output (as empty strings or null depending on context). If rows have different numbers of columns, the tool adapts by including all detected headers and leaving missing cell values empty.",
  },
  {
    question: "Can I customize field names or remove specific columns?",
    answer:
      "The tool auto-detects headers from your CSV's first row. You can manually adjust the output by editing the CSV data before conversion or post-processing the generated JSON.",
  },
  {
    question: "What's the best way to handle dates in CSV to JSON conversion?",
    answer:
      "Dates are preserved as strings in the JSON output. This ensures compatibility across systems. For date calculations or formatting, process the JSON string values in your application with a date library like Moment.js or the native Date object.",
  },
];

export const Route = createFileRoute("/_wrap/csv-to-json")({
  head: () =>
    getSeoMetadata({
      title: "CSV to JSON Converter | Convert CSV to JSON Online | SnapBit Tools",
      description:
        "Convert CSV data to JSON objects instantly. Handle headers, quoted fields, and large files locally in your browser. 100% free and private.",
      keywords: ["csv to json", "csv converter", "json generator", "csv to web", "online converter"],
      url: "/csv-to-json",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const MAX_UPLOAD_SIZE_MB = 5;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [sanitizeJson, setSanitizeJson] = useState(false);
  const [jsonOutput, setJsonOutput] = useState("");
  const [stats, setStats] = useState({ rows: 0, columns: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const loadSampleData = () => {
    const sample = `id,name,email,city,roles
1,"John Doe",john@example.com,"New York","admin,editor"
2,"Jane Smith",jane@example.com,London,user
3,"Bob ""The Builder"" Jones",bob@example.com,"San Francisco",guest`;
    setInput(sample);
    setError(null);
  };

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_UPLOAD_BYTES) {
        setError(
          `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum supported upload size is ${MAX_UPLOAD_SIZE_MB} MB to keep the page responsive.`,
        );
        event.target.value = "";
        return;
      }

      try {
        const content = await file.text();
        setInput(content);
        setError(null);
      } catch {
        setError("Failed to read CSV file. Please try another file.");
      } finally {
        event.target.value = "";
      }
    },
    [MAX_UPLOAD_BYTES, MAX_UPLOAD_SIZE_MB],
  );

  useEffect(() => {
    const worker = new Worker(new URL("../workers/csvToJson.worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current = worker;

    worker.onmessage = (
      event: MessageEvent<
        { requestId: number; jsonOutput: string; stats: { rows: number; columns: number } } | { requestId: number; error: string }
      >,
    ) => {
      const payload = event.data;
      if (payload.requestId !== requestIdRef.current) return;

      setIsProcessing(false);
      if ("error" in payload) {
        setError(payload.error);
        setJsonOutput("");
        setStats({ rows: 0, columns: 0 });
        return;
      }

      setError(null);
      setJsonOutput(payload.jsonOutput);
      setStats(payload.stats);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      requestIdRef.current += 1;
      setJsonOutput("");
      setStats({ rows: 0, columns: 0 });
      setError(null);
      setIsProcessing(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsProcessing(true);

    const timeout = window.setTimeout(() => {
      workerRef.current?.postMessage({
        input,
        hasHeader,
        sanitizeJson,
        requestId,
      });
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [input, hasHeader, sanitizeJson]);

  const copyToClipboard = useCallback(async () => {
    if (!jsonOutput) return;
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [jsonOutput]);

  const downloadJSON = useCallback(() => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted_data.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [jsonOutput]);

  return (
    <div className="min-h-screen py-2 px-4 flex flex-col">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        {/* <Breadcrumbs /> */}
        <div className="text-center mt-6 mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-theme-heading mb-2">
            CSV to <span className="text-brand-primary">JSON</span>
          </h1>
          <p className="text-md text-theme-body">Transform CSV data into JSON format securely in your browser.</p>
        </div>

        <div className="flex-1 max-w-7xl w-full mx-auto">
          <div className="bg-transparent rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-3 justify-center items-center">
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(tc.btnSecondary, "px-4 py-2 text-sm")}
              >
                <IconUpload className="w-4 h-4" />
                <span>Upload CSV</span>
              </button>

              <button
                onClick={loadSampleData}
                className={cn(tc.btnSecondary, "px-4 py-2 text-sm")}
              >
                <IconTable className="w-4 h-4" />
                <span>Sample CSV</span>
              </button>
              <div className="h-6 w-px bg-theme-border mx-2 hidden sm:block" />

              <label className="flex items-center space-x-2 text-theme-body text-sm cursor-pointer select-none bg-theme-surface-muted border border-theme-border px-3 py-2 rounded-lg hover:bg-theme-surface transition">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded border-theme-border text-brand-primary focus:ring-brand-primary bg-theme-input-bg"
                />
                <span>First row as header</span>
              </label>

              <label className="flex items-center space-x-2 text-theme-body text-sm cursor-pointer select-none bg-theme-surface-muted border border-theme-border px-3 py-2 rounded-lg hover:bg-theme-surface transition">
                <input
                  type="checkbox"
                  checked={sanitizeJson}
                  onChange={(e) => setSanitizeJson(e.target.checked)}
                  className="rounded border-theme-border text-brand-primary focus:ring-brand-primary bg-theme-input-bg"
                />
                <span>Sanitize JSON strings</span>
              </label>

              <button
                onClick={downloadJSON}
                disabled={!jsonOutput}
                className={cn(tc.btnPrimary, "px-4 py-2 ml-auto")}
              >
                <IconDownload className="w-4 h-4" />
                <span>Download JSON</span>
              </button>

              <button
                onClick={copyToClipboard}
                disabled={!jsonOutput}
                className={cn(
                  tc.btn,
                  "px-4 py-2",
                  copySuccess ? "theme-btn-success" : "theme-btn-secondary",
                )}
              >
                {copySuccess ? (
                  <>
                    <IconCheck className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setInput("");
                  setError(null);
                }}
                disabled={!input}
                className={cn(tc.btnDanger, "px-4 py-2")}
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className={cn(tc.alertError, "rounded-xl p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2")}>
              <IconAlertCircle className="w-5 h-5 text-[var(--theme-alert-error-icon)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Parse Error</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            <div className="rounded-xl shadow-lg flex flex-col h-full border border-theme-border bg-theme-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-theme-border flex justify-between items-center bg-theme-surface-muted">
                <h3 className="text-sm font-semibold text-theme-body uppercase tracking-wider">Input CSV</h3>
                {input && <span className="text-xs text-theme-muted">{(new Blob([input]).size / 1024).toFixed(2)} KB</span>}
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste CSV content here..."
                className={cn(
                  tc.field,
                  "flex-1 w-full p-4 font-mono text-sm resize-none focus:ring-0 border-0 rounded-none",
                  error && "bg-[var(--theme-alert-error-bg)]",
                )}
                spellCheck={false}
              />
            </div>

            <div className="rounded-xl shadow-lg flex flex-col h-full border border-theme-border bg-theme-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-theme-border flex justify-between items-center bg-theme-surface-muted">
                <h3 className="text-sm font-semibold text-theme-body uppercase tracking-wider">Output JSON</h3>
                {stats.rows > 0 && (
                  <span className="text-xs text-brand-primary bg-theme-icon-bg px-2 py-0.5 rounded-full">
                    {stats.rows} objects • {stats.columns} fields
                  </span>
                )}
                {isProcessing && <span className="text-xs text-theme-muted">Processing...</span>}
              </div>
              <textarea
                readOnly
                value={jsonOutput}
                placeholder="JSON output will appear here..."
                className={cn(
                  tc.field,
                  "flex-1 w-full p-4 font-mono text-sm resize-none focus:ring-0 border-0 rounded-none bg-theme-code-bg text-theme-code-text",
                )}
                spellCheck={false}
              />
            </div>
          </div>

          <ToolContentDisplay
            title={toolContent["csv-to-json"].title}
            intro={toolContent["csv-to-json"].intro}
            benefits={toolContent["csv-to-json"].benefits}
            useCases={toolContent["csv-to-json"].useCases}
          />

          <div className="mt-8">
            <ToolInfo
              title="CSV to JSON Converter"
              description="Easily transform CSV files or text into clean, structured JSON data. Perfect for developers, data scientists, and anyone needing to convert spreadsheet data for web applications or APIs."
              features={[
                {
                  title: "Smart Type Detection",
                  description: "Automatically detects and parses numbers and booleans into their correct JSON types.",
                  icon: IconBraces,
                },
                {
                  title: "Robust CSV Parsing",
                  description: "Handles complex CSV scenarios including quoted fields, escaped characters, and multi-line cells.",
                  icon: IconTable,
                },
                {
                  title: "Secure & Private",
                  description: "All conversion happens entirely in your browser. Your data is never uploaded to any server.",
                  icon: IconCheck,
                },
              ]}
              steps={[
                {
                  title: "Paste CSV",
                  description: "Input your CSV data into the left panel or click 'Sample CSV' to see how it works.",
                },
                {
                  title: "Configure",
                  description: "Choose whether the first row of your CSV contains column headers.",
                },
                {
                  title: "Review JSON",
                  description: "The structured JSON output is generated instantly in the right panel.",
                },
                {
                  title: "Export",
                  description: "Copy the JSON to your clipboard or download it as a .json file.",
                },
              ]}
              faqs={faqs}
            />
          </div>
        </div>

        <RelatedTools currentToolSlug="csv-to-json" category="Data" />

        <footer className="mt-8 text-center">
          <p className="text-theme-muted text-xs">
            Crafted with care by{" "}
            <a
              href="https://sidme.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-hover transition-colors"
            >
              sidme
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
