import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconFileSpreadsheet,
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
      "Yes, absolutely. The conversion process is entirely client-side, meaning your JSON data never leaves your browser. No servers are involved.",
  },
  {
    question: "Can I convert nested JSON objects?",
    answer:
      "Yes, the tool attempts to flatten nested objects into dot-notation keys (e.g., 'address.city') to fit into a CSV table structure.",
  },
  {
    question: "Is there a limit on file size?",
    answer:
      "The limit depends on your browser's memory, as processing happens locally. For very large files (100MB+), performance may slow down.",
  },
];

export const Route = createFileRoute("/json-to-csv")({
  head: () =>
    getSeoMetadata({
      title: "JSON to CSV Converter | Convert JSON to CSV Online | SnapBit Tools",
      description:
        "Convert JSON arrays to CSV instantly. Flatten nested objects, handle large files, and process everything locally in your browser. 100% free and private.",
      keywords: [
        "json to csv",
        "json converter",
        "csv generator",
        "json to excel",
        "online converter",
      ],
      url: "/json-to-csv",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [flatten, setFlatten] = useState(true);

  // Sample data for quick testing
  const loadSampleData = () => {
    const sample = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        address: {
          city: "New York",
          zip: "10001",
        },
        roles: ["admin", "editor"],
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        address: {
          city: "London",
          zip: "SW1A",
        },
        roles: ["user"],
      },
    ];
    setInput(JSON.stringify(sample, null, 2));
    setError(null);
  };

  const { csvOutput, stats } = useMemo(() => {
    if (!input.trim()) {
      return { csvOutput: "", stats: { rows: 0, columns: 0 } };
    }

    try {
      let jsonData;
      try {
        jsonData = JSON.parse(input);
      } catch (e) {
        throw new Error("Invalid JSON format");
      }

      if (!Array.isArray(jsonData)) {
        // If it's a single object, wrap it in an array
        if (typeof jsonData === "object" && jsonData !== null) {
          jsonData = [jsonData];
        } else {
          throw new Error("JSON input must be an array of objects or a single object");
        }
      }

      if (jsonData.length === 0) {
        return { csvOutput: "", stats: { rows: 0, columns: 0 } };
      }

      // Helper to flatten object
      const flattenObject = (obj: any, prefix = "", res: any = {}) => {
        for (const key in obj) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;

          if (typeof value === "object" && value !== null && flatten) {
            // If array, just join or stringify to keep it simple in one cell,
            // unless we want to expand arrays which gets complex quickly.
            // For now, let's stringify arrays and flatten objects.
            if (Array.isArray(value)) {
              res[newKey] = JSON.stringify(value);
            } else {
              flattenObject(value, newKey, res);
            }
          } else {
            res[newKey] = value;
          }
        }
        return res;
      };

      const processedData = jsonData.map((item: any) => (flatten ? flattenObject(item) : item));

      // Collect all unique headers
      const headersSet = new Set<string>();
      processedData.forEach((item: any) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((k) => headersSet.add(k));
        }
      });
      const headers = Array.from(headersSet);

      if (headers.length === 0) {
        // Can happen if array has primitives like [1, 2, 3]
        // We can handle primitives by treating them as value
        const isPrimitiveArray = jsonData.every((i: any) => typeof i !== "object" || i === null);
        if (isPrimitiveArray) {
          return {
            csvOutput: "value\n" + jsonData.join("\n"),
            stats: { rows: jsonData.length, columns: 1 },
          };
        }
      }

      // Generate CSV
      const csvRows = [headers.join(",")];

      for (const item of processedData) {
        const row = headers.map((header) => {
          let val = item[header];

          if (val === undefined || val === null) {
            val = "";
          } else if (typeof val === "object") {
            val = JSON.stringify(val);
          } else {
            val = String(val);
          }

          // Escape quotes and wrap in quotes if contains comma, quote or newline
          if (val.includes('"') || val.includes(",") || val.includes("\n")) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvRows.push(row.join(","));
      }

      const output = csvRows.join("\n");
      setError(null);
      return {
        csvOutput: output,
        stats: { rows: processedData.length, columns: headers.length },
      };
    } catch (e) {
      setError((e as Error).message);
      return { csvOutput: "", stats: { rows: 0, columns: 0 } };
    }
  }, [input, flatten]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!csvOutput) return;
    try {
      await navigator.clipboard.writeText(csvOutput);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [csvOutput]);

  // Download CSV
  const downloadCSV = useCallback(() => {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted_data.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [csvOutput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">
          JSON to <span className="text-brand-primary">CSV</span> Converter
        </h1>
        <p className="text-md text-gray-200">
          Transform JSON data into CSV content securely in your browser.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-9xl w-full mx-auto">
        {/* Toolbar */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
            >
              <IconTable className="w-4 h-4" />
              <span>Sample Data</span>
            </button>
            <div className="h-6 w-px bg-gray-600 mx-2 hidden sm:block"></div>

            <label className="flex items-center space-x-2 text-gray-200 text-sm cursor-pointer select-none bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-700 transition">
              <input
                type="checkbox"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                className="rounded border-gray-600 text-brand-primary focus:ring-offset-0 focus:ring-brand-primary bg-gray-700"
              />
              <span>Flatten nested objects</span>
            </label>

            <button
              onClick={downloadCSV}
              disabled={!csvOutput}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              <IconDownload className="w-4 h-4" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={copyToClipboard}
              disabled={!csvOutput}
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
                  <span>Copy CSV</span>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <IconAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-300">
              <p className="font-medium">Parse Error</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Editor Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Input Panel */}
          <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col h-full border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Input JSON
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
              placeholder='Paste JSON array here, e.g. [{"name": "Neo", "role": "One"}]'
              className={`flex-1 w-full p-4 bg-gray-900/50 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-0 border-0 ${
                error ? "bg-red-900/10" : ""
              }`}
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col h-full border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Output CSV
              </h3>
              {stats.rows > 0 && (
                <span className="text-xs text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                  {stats.rows} rows • {stats.columns} cols
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={csvOutput}
              placeholder="CSV output will appear here..."
              className="flex-1 w-full p-4 bg-gray-900/50 text-green-400 font-mono text-sm resize-none focus:outline-none focus:ring-0 border-0"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="mt-8">
          <ToolInfo
            title="JSON to CSV Converter"
            description="Our JSON to CSV Converter is the perfect tool for data analysts and developers who need to transform structured JSON data into spreadsheet-friendly CSV format. Whether you're migrating data, preparing reports, or just need to view JSON in Excel, this tool handles it all locally on your device."
            features={[
              {
                title: "Flatten Nested Objects",
                description:
                  "Automatically converts nested JSON objects into flattened dot-notation columns.",
                icon: IconTable,
              },
              {
                title: "Privacy First",
                description:
                  "All conversion happens in your browser. No data is ever sent to a server.",
                icon: IconFileSpreadsheet,
              },
              {
                title: "Large File Support",
                description:
                  "Efficiently handles large JSON datasets without crashing your browser.",
                icon: IconDownload,
              },
            ]}
            steps={[
              {
                title: "Paste JSON",
                description: "Paste your JSON array or object into the left input panel.",
              },
              {
                title: "Configure",
                description: "Toggle 'Flatten nested objects' based on your needs.",
              },
              {
                title: "Convert",
                description: "The CSV output is generated instantly as you type.",
              },
              {
                title: "Download",
                description: "Copy the CSV text or download it as a .csv file.",
              },
            ]}
            faqs={faqs}
          />
        </div>
      </div>

      <RelatedTools
        currentToolSlug="json-to-csv"
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
