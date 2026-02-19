import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconBraces,
  IconTrash,
  IconAlertCircle,
  IconTable,
} from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "Is my data secure?",
    answer:
      "Yes, absolutely. The conversion process is entirely client-side, meaning your CSV data never leaves your browser. No servers are involved.",
  },
  {
    question: "Can I handle CSVs with newlines in cells?",
    answer:
      "Yes, the parser correctly handles quoted fields containing newlines, commas, or escaped quotes.",
  },
  {
    question: "Is there a limit on file size?",
    answer:
      "The limit depends on your browser's memory, as processing happens locally. For very large files (50MB+), performance may slow down.",
  },
];

export const Route = createFileRoute("/csv-to-json")({
  head: () =>
    getSeoMetadata({
      title: "CSV to JSON Converter | Convert CSV to JSON Online | SnapBit Tools",
      description:
        "Convert CSV data to JSON objects instantly. Handle headers, quoted fields, and large files locally in your browser. 100% free and private.",
      keywords: [
        "csv to json",
        "csv converter",
        "json generator",
        "csv to web",
        "online converter",
      ],
      url: "/csv-to-json",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);

  const loadSampleData = () => {
    const sample = `id,name,email,city,roles
1,"John Doe",john@example.com,"New York","admin,editor"
2,"Jane Smith",jane@example.com,London,user
3,"Bob ""The Builder"" Jones",bob@example.com,"San Francisco",guest`;
    setInput(sample);
    setError(null);
  };

  const { jsonOutput, stats } = useMemo(() => {
    if (!input.trim()) {
      return { jsonOutput: "", stats: { rows: 0, columns: 0 } };
    }

    try {
      // Robust CSV Parser
      const parseCSV = (text: string) => {
        const result = [];
        let row = [];
        let cell = "";
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];

          if (inQuotes) {
            if (char === '"') {
              if (nextChar === '"') {
                cell += '"';
                i++; // Skip next quote
              } else {
                inQuotes = false;
              }
            } else {
              cell += char;
            }
          } else {
            if (char === '"') {
              inQuotes = true;
            } else if (char === ",") {
              row.push(cell.trim());
              cell = "";
            } else if (char === "\n" || char === "\r") {
              row.push(cell.trim());
              if (row.length > 0 && (row.length > 1 || row[0] !== "")) {
                result.push(row);
              }
              row = [];
              cell = "";
              if (char === "\r" && nextChar === "\n") i++; // Handle CRLF
            } else {
              cell += char;
            }
          }
        }

        // Handle last cell/row
        if (cell || row.length > 0) {
          row.push(cell.trim());
          result.push(row);
        }

        return result;
      };

      const rows = parseCSV(input);
      if (rows.length === 0) {
        return { jsonOutput: "", stats: { rows: 0, columns: 0 } };
      }

      let result;
      let headerCount = 0;

      if (hasHeader) {
        const headers = rows[0];
        headerCount = headers.length;
        const dataRows = rows.slice(1);

        result = dataRows.map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            let value: any = row[index] !== undefined ? row[index] : null;

            // Try to parse numbers and booleans
            if (typeof value === "string") {
              if (value.toLowerCase() === "true") value = true;
              else if (value.toLowerCase() === "false") value = false;
              else if (!isNaN(Number(value)) && value !== "") value = Number(value);
            }

            obj[header || `column${index + 1}`] = value;
          });
          return obj;
        });
      } else {
        headerCount = rows[0].length;
        result = rows.map((row) => {
          return row.map((cell) => {
            let value = cell;
            if (value.toLowerCase() === "true") return true;
            if (value.toLowerCase() === "false") return false;
            if (!isNaN(Number(value)) && value !== "") return Number(value);
            return value;
          });
        });
      }

      const output = JSON.stringify(result, null, 2);
      setError(null);
      return {
        jsonOutput: output,
        stats: { rows: result.length, columns: headerCount },
      };
    } catch (e) {
      setError((e as Error).message);
      return { jsonOutput: "", stats: { rows: 0, columns: 0 } };
    }
  }, [input, hasHeader]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">
          CSV to <span className="text-brand-primary">JSON</span> Converter
        </h1>
        <p className="text-md text-gray-200">
          Transform CSV data into JSON format securely in your browser.
        </p>
      </div>

      <div className="flex-1 max-w-9xl w-full mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
            >
              <IconTable className="w-4 h-4" />
              <span>Sample CSV</span>
            </button>
            <div className="h-6 w-px bg-gray-600 mx-2 hidden sm:block"></div>

            <label className="flex items-center space-x-2 text-gray-200 text-sm cursor-pointer select-none bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-700 transition">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-gray-600 text-brand-primary focus:ring-offset-0 focus:ring-brand-primary bg-gray-700"
              />
              <span>First row as header</span>
            </label>

            <button
              onClick={downloadJSON}
              disabled={!jsonOutput}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              <IconDownload className="w-4 h-4" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={copyToClipboard}
              disabled={!jsonOutput}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                copySuccess
                  ? "bg-green-800 text-green-200"
                  : "bg-gray-700 text-gray-100 hover:bg-gray-600"
              }`}
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-200 rounded-lg hover:bg-red-800/70 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <IconAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-300">
              <p className="font-medium">Parse Error</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col h-full border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Input CSV
              </h3>
              {input && (
                <span className="text-xs text-gray-500">
                  {(new Blob([input]).size / 1024).toFixed(2)} KB
                </span>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste CSV content here..."
              className={`flex-1 w-full p-4 bg-gray-900/50 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-0 border-0 ${
                error ? "bg-red-900/10" : ""
              }`}
              spellCheck={false}
            />
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col h-full border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Output JSON
              </h3>
              {stats.rows > 0 && (
                <span className="text-xs text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                  {stats.rows} objects • {stats.columns} fields
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={jsonOutput}
              placeholder="JSON output will appear here..."
              className="flex-1 w-full p-4 bg-gray-900/50 text-green-400 font-mono text-sm resize-none focus:outline-none focus:ring-0 border-0"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="mt-8">
          <ToolInfo
            title="CSV to JSON Converter"
            description="Easily transform CSV files or text into clean, structured JSON data. Perfect for developers, data scientists, and anyone needing to convert spreadsheet data for web applications or APIs."
            features={[
              {
                title: "Smart Type Detection",
                description:
                  "Automatically detects and parses numbers and booleans into their correct JSON types.",
                icon: IconBraces,
              },
              {
                title: "Robust CSV Parsing",
                description:
                  "Handles complex CSV scenarios including quoted fields, escaped characters, and multi-line cells.",
                icon: IconTable,
              },
              {
                title: "Secure & Private",
                description:
                  "All conversion happens entirely in your browser. Your data is never uploaded to any server.",
                icon: IconCheck,
              },
            ]}
            steps={[
              {
                title: "Paste CSV",
                description:
                  "Input your CSV data into the left panel or click 'Sample CSV' to see how it works.",
              },
              {
                title: "Configure",
                description: "Choose whether the first row of your CSV contains column headers.",
              },
              {
                title: "Review JSON",
                description:
                  "The structured JSON output is generated instantly in the right panel.",
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

      <RelatedTools
        currentToolSlug="csv-to-json"
        category="Data"
      />

      <footer className="mt-8 text-center">
        <p className="text-gray-400 text-xs">
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
  );
}
