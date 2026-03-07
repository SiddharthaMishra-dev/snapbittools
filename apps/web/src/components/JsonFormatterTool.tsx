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

type TokenType = "bracket" | "key" | "string" | "number" | "boolean" | "null" | "punctuation";

interface Token {
  type: TokenType;
  value: string;
}

export function JsonFormatterTool() {
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
    <div className="flex-1 max-w-9xl w-full mx-auto">
      {/* Toolbar */}
      <div className=" rounded-xl shadow-lg p-4 mb-6">
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
        <div className="rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your JSON here, e.g., {"name": "John", "age": 30}'
            className={`w-full h-96 p-4 border rounded-lg  text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
        <div className=" rounded-xl shadow-lg p-6">
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
            className="w-full h-96 p-4 border border-gray-600 rounded-lg  font-mono text-sm overflow-auto"
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
    </div>
  );
}
