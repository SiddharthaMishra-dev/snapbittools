import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconBraces,
  IconArrowsMinimize,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";

type TokenType = "bracket" | "key" | "string" | "number" | "boolean" | "null" | "punctuation";

interface Token {
  type: TokenType;
  value: string;
}

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "Is it safe to paste my JSON data here?",
    answer:
      "Yes! Your data never leaves your browser. All formatting, validation, and minification are done locally using JavaScript. We don't have a backend to store or even see your data.",
  },
  {
    question: "What is the difference between formatting and minifying?",
    answer:
      "Formatting (or 'beautifying') adds whitespace and indentation to make JSON human-readable. Minifying removes all unnecessary whitespace to reduce the character count, which is better for API responses and storage.",
  },
  {
    question: "Can I validate invalid JSON here?",
    answer:
      "Yes, the tool will immediately highlight syntax errors and provide details on what's wrong, helping you fix your JSON structure quickly.",
  },
  {
    question: "Does it support large JSON files?",
    answer:
      "The tool can handle JSON files of several megabytes quite easily. However, extremely large files (50MB+) might cause your browser to lag during formatting.",
  },
];

export const Route = createFileRoute("/json-formatter")({
  head: () =>
    getSeoMetadata({
      title: "JSON Formatter & Validator | Beautify JSON | JS DevTools",
      description:
        "Format, validate, and minify JSON strings instantly. Privacy-focused, 100% client-side, and works offline.",
      keywords: ["json formatter", "json validator", "beautify json", "minify json", "json editor"],
      url: "/json-formatter",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeView, setActiveView] = useState<"formatted" | "minified">("formatted");
  const [useSingleQuotes, setUseSingleQuotes] = useState(false);

  const { formattedJson, minifiedJson, tokens, parsedData } = useMemo(() => {
    if (!input.trim()) {
      return { formattedJson: "", minifiedJson: "", tokens: [], parsedData: null };
    }

    try {
      const parsed = parseJsonWithFallback(input);
      setError(null);
      const baseFormatted = JSON.stringify(parsed, null, 2);
      const baseMinified = JSON.stringify(parsed);
      const finalFormatted = useSingleQuotes ? convertToSingleQuotes(baseFormatted) : baseFormatted;
      const finalMinified = useSingleQuotes ? convertToSingleQuotes(baseMinified) : baseMinified;
      return {
        formattedJson: finalFormatted,
        minifiedJson: finalMinified,
        tokens: tokenizeJson(finalFormatted),
        parsedData: parsed,
      };
    } catch (e) {
      setError((e as Error).message);
      return { formattedJson: "", minifiedJson: "", tokens: [], parsedData: null };
    }
  }, [input, useSingleQuotes]);

  function convertToSingleQuotes(json: string): string {
    return json.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, "'$1'");
  }

  function convertSingleQuotesToDouble(text: string): string {
    // Convert single quotes to double quotes while preserving escaped quotes
    return text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  }

  function parseJsonWithFallback(text: string): any {
    try {
      // First try parsing as standard JSON (double quotes)
      return JSON.parse(text);
    } catch (e) {
      try {
        // If that fails, try converting single quotes to double quotes and parse again
        const convertedText = convertSingleQuotesToDouble(text);
        return JSON.parse(convertedText);
      } catch (e2) {
        // If both fail, throw the original error
        throw e;
      }
    }
  }

  function tokenizeJson(json: string): Token[] {
    const tokens: Token[] = [];
    const quoteChar = useSingleQuotes ? "'" : '"';
    const escapedQuote = useSingleQuotes ? "\\\\.|[^'\\\\]" : '\\\\.|[^"\\\\]';
    const regex = new RegExp(
      `(${quoteChar}(?:${escapedQuote})*${quoteChar})\\s*:|(${quoteChar}(?:${escapedQuote})*${quoteChar})|(-?\\d+\\.?\\d*(?:[eE][+-]?\\d+)?)|(\\btrue\\b|\\bfalse\\b)|(\\bnull\\b)|([\\[\\]{}])|([,:])`,
      "g",
    );
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(json)) !== null) {
      // Add whitespace before token
      if (match.index > lastIndex) {
        const whitespace = json.slice(lastIndex, match.index);
        if (whitespace) {
          tokens.push({ type: "punctuation", value: whitespace });
        }
      }

      if (match[1]) {
        tokens.push({ type: "key", value: match[1] });
      } else if (match[2]) {
        tokens.push({ type: "string", value: match[2] });
      } else if (match[3]) {
        tokens.push({ type: "number", value: match[3] });
      } else if (match[4]) {
        tokens.push({ type: "boolean", value: match[4] });
      } else if (match[5]) {
        tokens.push({ type: "null", value: match[5] });
      } else if (match[6]) {
        tokens.push({ type: "bracket", value: match[6] });
      } else if (match[7]) {
        tokens.push({ type: "punctuation", value: match[7] });
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining content
    if (lastIndex < json.length) {
      tokens.push({ type: "punctuation", value: json.slice(lastIndex) });
    }

    return tokens;
  }

  function getTokenClass(type: TokenType): string {
    switch (type) {
      case "bracket":
        return "text-blue-400 font-bold";
      case "key":
        return "text-cyan-400";
      case "string":
        return "text-green-400";
      case "number":
        return "text-orange-400";
      case "boolean":
        return "text-purple-400";
      case "null":
        return "text-purple-400";
      default:
        return "text-gray-300";
    }
  }

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    const textToCopy = activeView === "formatted" ? formattedJson : minifiedJson;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [activeView, formattedJson, minifiedJson]);

  // Convert JSON to CSV and download
  const downloadCSV = useCallback(() => {
    if (!parsedData) return;

    // Handle array of objects
    let dataArray: Record<string, unknown>[];
    if (Array.isArray(parsedData)) {
      dataArray = parsedData;
    } else if (typeof parsedData === "object") {
      dataArray = [parsedData];
    } else {
      setError("JSON must be an object or array of objects to convert to CSV");
      return;
    }

    if (dataArray.length === 0) {
      setError("JSON array is empty");
      return;
    }

    // Get all unique keys from all objects
    const keys = new Set<string>();
    dataArray.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => keys.add(key));
      }
    });
    const headers = Array.from(keys);

    if (headers.length === 0) {
      setError("No valid keys found in JSON");
      return;
    }

    // Create CSV content
    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return "";
      const str = typeof value === "object" ? JSON.stringify(value) : String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(","),
      ...dataArray.map((item) =>
        headers.map((key) => escapeCSV((item as Record<string, unknown>)?.[key] ?? "")).join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [parsedData]);

  // Clear input
  const clearInput = () => {
    setInput("");
    setError(null);
  };

  // Apply formatting to input
  const formatInput = () => {
    if (formattedJson) {
      setInput(formattedJson);
      setActiveView("formatted");
    }
  };

  // Apply minification to input
  const minifyInput = () => {
    if (minifiedJson) {
      setInput(minifiedJson);
      setActiveView("minified");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">
          JSON <span className="text-blue-400">Formatter</span>
        </h1>
        <p className="text-md text-gray-200">
          Format, validate & minify JSON instantly. No data sent to servers—completely private.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-9xl w-full mx-auto">
        {/* Toolbar */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg">
              <span className="text-sm font-medium">Quotes:</span>
              <button
                onClick={() => setUseSingleQuotes(false)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  !useSingleQuotes
                    ? "bg-blue-700 text-blue-100"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                "
              </button>
              <button
                onClick={() => setUseSingleQuotes(true)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  useSingleQuotes
                    ? "bg-blue-700 text-blue-100"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                '
              </button>
            </div>

            <button
              onClick={formatInput}
              disabled={!input.trim() || !!error}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-blue-100 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconBraces className="w-4 h-4" />
              <span>Format</span>
            </button>

            <button
              onClick={minifyInput}
              disabled={!input.trim() || !!error}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-blue-100 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconArrowsMinimize className="w-4 h-4" />
              <span>Minify</span>
            </button>

            <button
              onClick={copyToClipboard}
              disabled={!formattedJson}
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
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={downloadCSV}
              disabled={!parsedData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconDownload className="w-4 h-4" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={clearInput}
              disabled={!input}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-900 text-red-200 rounded-lg hover:bg-red-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 flex items-start gap-3">
            <IconAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-300">
              <p className="font-medium">Invalid JSON</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Editor Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Input</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste your JSON here, e.g., {"name": "John", "age": 30}'
              className={`w-full h-96 p-4 border rounded-lg bg-gray-700 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-600"
              }`}
              spellCheck={false}
            />
            {input && (
              <p className="text-sm text-gray-400 mt-2">
                Size: {new Blob([input]).size.toLocaleString()} bytes
              </p>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-100">Output</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveView("formatted")}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    activeView === "formatted"
                      ? "bg-blue-700 text-blue-100"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setActiveView("minified")}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    activeView === "minified"
                      ? "bg-blue-700 text-blue-100"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Minified
                </button>
              </div>
            </div>
            <pre
              className="w-full h-96 p-4 border border-gray-600 rounded-lg bg-gray-900 font-mono text-sm overflow-auto"
              style={{ tabSize: 2 }}
            >
              {activeView === "formatted" ? (
                tokens.length > 0 ? (
                  tokens.map((token, index) => (
                    <span
                      key={index}
                      className={getTokenClass(token.type)}
                    >
                      {token.value}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">Formatted JSON will appear here...</span>
                )
              ) : minifiedJson ? (
                <span className="text-gray-300 break-all">{minifiedJson}</span>
              ) : (
                <span className="text-gray-500">Minified JSON will appear here...</span>
              )}
            </pre>
            {formattedJson && (
              <p className="text-sm text-gray-400 mt-2">
                Size:{" "}
                {new Blob([
                  activeView === "formatted" ? formattedJson : minifiedJson,
                ]).size.toLocaleString()}{" "}
                bytes
              </p>
            )}
          </div>
        </div>
        <ToolInfo
          title="JSON Formatter & Validator"
          description="Our JSON Formatter is a comprehensive suite for developers to clean, validate, and optimize JSON data. Whether you need to beautify deep nested objects for readability or minify data for production use, this tool provides a secure, client-side environment for all your JSON needs."
          features={[
            {
              title: "Smart Formatting",
              description:
                "Automatic indentation and syntax highlighting make scanning complex JSON structures effortless.",
              icon: IconBraces,
            },
            {
              title: "Instant Minification",
              description:
                "Strip whitespaces and newlines to reduce payload size for API calls and configuration files.",
              icon: IconArrowsMinimize,
            },
            {
              title: "CSV Export",
              description:
                "Convert arrays of JSON objects into CSV format instantly for spreadsheet analysis.",
              icon: IconDownload,
            },
          ]}
          steps={[
            {
              title: "Paste JSON",
              description:
                "Input your raw JSON string into the left editor panel. It can even handle single quotes!",
            },
            {
              title: "Auto-Validate",
              description:
                "The tool immediately checks for syntax errors and provides helpful debugging messages.",
            },
            {
              title: "Apply View",
              description:
                'Switch between "Formatted" and "Minified" views to see your data in different contexts.',
            },
            {
              title: "Export & Copy",
              description:
                "Copy your formatted JSON to the clipboard or download the result as a file.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools
        currentToolSlug="json-formatter"
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
