import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconBraces,
  IconArrowsMinimize,
  IconTrash,
  IconAlertCircle,
  IconMaximize,
  IconMinimize,
  IconChevronRight,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeView, setActiveView] = useState<"formatted" | "minified">("formatted");
  const [useSingleQuotes, setUseSingleQuotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const { formattedJson, minifiedJson, parsedData } = useMemo(() => {
    if (!input.trim()) {
      return { formattedJson: "", minifiedJson: "", parsedData: null as JsonValue | null };
    }

    try {
      const parsed = parseJsonWithFallback(input) as JsonValue;
      setError(null);
      const baseFormatted = JSON.stringify(parsed, null, 2);
      const baseMinified = JSON.stringify(parsed);
      const finalFormatted = useSingleQuotes ? convertToSingleQuotes(baseFormatted) : baseFormatted;
      const finalMinified = useSingleQuotes ? convertToSingleQuotes(baseMinified) : baseMinified;
      return {
        formattedJson: finalFormatted,
        minifiedJson: finalMinified,
        parsedData: parsed,
      };
    } catch (e) {
      setError((e as Error).message);
      return { formattedJson: "", minifiedJson: "", parsedData: null as JsonValue | null };
    }
  }, [input, useSingleQuotes]);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFullscreen]);

  function convertToSingleQuotes(json: string): string {
    return json.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, "'$1'");
  }

  function convertSingleQuotesToDouble(text: string): string {
    // Convert single quotes to double quotes while preserving escaped quotes
    return text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  }

  function parseJsonWithFallback(text: string): unknown {
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

  function isObjectValue(value: JsonValue): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function escapeStringValue(value: string): string {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f");
  }

  function formatQuoted(value: string): string {
    const quote = useSingleQuotes ? "'" : '"';
    const escaped = escapeStringValue(value).replace(new RegExp(quote, "g"), `\\${quote}`);
    return `${quote}${escaped}${quote}`;
  }

  function formatPrimitive(value: Exclude<JsonValue, JsonValue[] | { [key: string]: JsonValue }>): ReactNode {
    if (typeof value === "string") {
      return <span className="text-green-400">{formatQuoted(value)}</span>;
    }

    if (typeof value === "number") {
      return <span className="text-orange-400">{value}</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-400">{String(value)}</span>;
    }

    return <span className="text-purple-400">null</span>;
  }

  const togglePath = useCallback((path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const renderJsonNode = useCallback(
    (value: JsonValue, path: string, depth: number, isLast: boolean, keyName?: string): ReactNode => {
      const isArray = Array.isArray(value);
      const isObject = isObjectValue(value);
      const isContainer = isArray || isObject;
      const entries = isArray ? value : isObject ? Object.entries(value) : [];
      const isCollapsible = isContainer && entries.length > 0;
      const isCollapsed = isCollapsible && collapsedPaths.has(path);
      const trailingComma = isLast ? "" : ",";

      const keyPrefix = keyName ? (
        <>
          <span className="text-cyan-400">{formatQuoted(keyName)}</span>
          <span className="text-gray-300">: </span>
        </>
      ) : null;

      if (!isContainer) {
        return (
          <div key={path} className="flex items-start" style={{ paddingLeft: `${depth * 16}px` }}>
            <span className="w-5 h-5 mr-1" />
            <div className="leading-6 whitespace-pre">
              {keyPrefix}
              {formatPrimitive(value as Exclude<JsonValue, JsonValue[] | { [key: string]: JsonValue }>)}
              <span className="text-gray-300">{trailingComma}</span>
            </div>
          </div>
        );
      }

      const openBracket = isArray ? "[" : "{";
      const closeBracket = isArray ? "]" : "}";

      if (isCollapsed) {
        return (
          <div key={path} className="flex items-start" style={{ paddingLeft: `${depth * 16}px` }}>
            <button
              type="button"
              onClick={() => togglePath(path)}
              className="w-5 h-5 mr-1 mt-0.5 text-gray-300 hover:text-gray-100"
              aria-label="Expand section"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>
            <div className="leading-6 whitespace-pre">
              {keyPrefix}
              <span className="text-blue-400 font-bold">{openBracket}</span>
              <span className="text-gray-400">...</span>
              <span className="text-blue-400 font-bold">{closeBracket}</span>
              <span className="text-gray-300">{trailingComma}</span>
            </div>
          </div>
        );
      }

      return (
        <div key={path}>
          <div className="flex items-start" style={{ paddingLeft: `${depth * 16}px` }}>
            {isCollapsible ? (
              <button
                type="button"
                onClick={() => togglePath(path)}
                className="w-5 h-5 mr-1 mt-0.5 text-gray-300 hover:text-gray-100"
                aria-label="Collapse section"
              >
                <IconChevronDown className="w-4 h-4" />
              </button>
            ) : (
              <span className="w-5 h-5 mr-1" />
            )}
            <div className="leading-6 whitespace-pre">
              {keyPrefix}
              <span className="text-blue-400 font-bold">{openBracket}</span>
            </div>
          </div>

          {isArray
            ? value.map((item, index) =>
                renderJsonNode(item, `${path}[${index}]`, depth + 1, index === value.length - 1),
              )
            : Object.entries(value).map(([childKey, childValue], index, allEntries) =>
                renderJsonNode(childValue, `${path}.${childKey}`, depth + 1, index === allEntries.length - 1, childKey),
              )}

          <div className="flex items-start" style={{ paddingLeft: `${depth * 16}px` }}>
            <span className="w-5 h-5 mr-1" />
            <div className="leading-6 whitespace-pre">
              <span className="text-blue-400 font-bold">{closeBracket}</span>
              <span className="text-gray-300">{trailingComma}</span>
            </div>
          </div>
        </div>
      );
    },
    [collapsedPaths, togglePath, useSingleQuotes],
  );

  const renderOutputContent = (heightClass: string) => (
    <pre className={`w-full ${heightClass} p-4 border border-gray-600 rounded-lg font-mono text-sm overflow-auto`} style={{ tabSize: 2 }}>
      {activeView === "formatted" ? (
        parsedData ? (
          renderJsonNode(parsedData, "$", 0, true)
        ) : (
          <span className="text-gray-500">Formatted JSON will appear here...</span>
        )
      ) : minifiedJson ? (
        <span className="text-gray-300 break-all">{minifiedJson}</span>
      ) : (
        <span className="text-gray-500">Minified JSON will appear here...</span>
      )}
    </pre>
  );

  const renderEditorPanels = (isInModal: boolean) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 sm:gap-0 gap-6">
      <div className="rounded-xl shadow-lg p-0 sm:p-6">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Input</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste your JSON here, e.g., {"name": "John", "age": 30}'
          className={`w-full ${isInModal ? "min-h-[40vh] h-auto" : "h-96"} p-4 border rounded-lg text-gray-100 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-600"
          }`}
          spellCheck={false}
        />
        {input && <p className="text-sm text-gray-400 mt-2">Size: {new Blob([input]).size.toLocaleString()} bytes</p>}
      </div>

      <div className="rounded-xl shadow-lg p-0 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-100">Output</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("formatted")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeView === "formatted" ? "bg-blue-700 text-blue-100" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Formatted
            </button>
            <button
              onClick={() => setActiveView("minified")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeView === "minified" ? "bg-blue-700 text-blue-100" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Minified
            </button>
          </div>
        </div>
        {renderOutputContent(isInModal ? "min-h-[40vh] h-auto" : "h-96")}
        {formattedJson && (
          <p className="text-sm text-gray-400 mt-2">
            Size: {new Blob([activeView === "formatted" ? formattedJson : minifiedJson]).size.toLocaleString()} bytes
          </p>
        )}
      </div>
    </div>
  );

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
    let dataArray: JsonObject[];
    if (Array.isArray(parsedData)) {
      const objectItems = parsedData.filter(
        (item): item is JsonObject => typeof item === "object" && item !== null && !Array.isArray(item),
      );

      if (objectItems.length !== parsedData.length) {
        setError("JSON array must contain only objects to convert to CSV");
        return;
      }

      dataArray = objectItems;
    } else if (typeof parsedData === "object" && parsedData !== null && !Array.isArray(parsedData)) {
      dataArray = [parsedData as JsonObject];
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
      ...dataArray.map((item) => headers.map((key) => escapeCSV(item[key] ?? "")).join(",")),
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
    <div className="flex-1 max-w-7xl w-full mx-auto">
      {/* Toolbar */}
      <div className=" rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg">
            <span className="text-sm font-medium">Quotes:</span>
            <button
              onClick={() => setUseSingleQuotes(false)}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                !useSingleQuotes ? "bg-blue-700 text-blue-100" : "bg-gray-600 text-gray-300 hover:bg-gray-500"
              }`}
            >
              "
            </button>
            <button
              onClick={() => setUseSingleQuotes(true)}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                useSingleQuotes ? "bg-blue-700 text-blue-100" : "bg-gray-600 text-gray-300 hover:bg-gray-500"
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
              copySuccess ? "bg-green-800 text-green-200" : "bg-gray-700 text-gray-100 hover:bg-gray-600"
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

          <button
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            <IconMaximize className="w-4 h-4" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 flex items-start gap-3">
          <IconAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-red-300">
            <p className="font-medium">Invalid JSON</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      {renderEditorPanels(false)}

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/80 p-2 sm:p-4">
          <div className="h-full w-full rounded-xl border border-gray-700 bg-black/80 p-3 sm:p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-100">JSON Formatter - Fullscreen</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <IconMinimize className="w-4 h-4" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="inline-flex items-center justify-center p-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
                  aria-label="Close fullscreen modal"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </div>
            {renderEditorPanels(true)}
          </div>
        </div>
      )}
    </div>
  );
}
