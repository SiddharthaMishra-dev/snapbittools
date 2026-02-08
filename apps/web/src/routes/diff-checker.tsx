import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  IconArrowsExchange,
  IconCopy,
  IconTrash,
  IconColumns,
  IconLayoutList,
  IconBolt,
  IconLock,
  IconSearch,
} from "@tabler/icons-react";

import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import { getSeoMetadata } from "@/lib/seo";
import { computeDiff, DiffLine } from "@/lib/diffFn";

const faqs = [
  {
    question: "How does the diff checker work?",
    answer:
      "Our diff checker uses a line-based comparison algorithm to identify additions, deletions, and common parts between two text inputs. It then visualizes these differences side-by-side or in a unified view.",
  },
  {
    question: "Is my data safe when comparing files?",
    answer:
      "Absolutely. Like all our tools, the Diff Checker runs 100% in your browser. Your text is never sent to any server, ensuring complete privacy for your sensitive data or code.",
  },
  {
    question: "Can I compare large files?",
    answer:
      "Yes, the tool is optimized for performance. However, extremely large files (many megabytes) might experience some lag due to the browser's processing limits. For most code and document comparisons, it works instantly.",
  },
  {
    question: "What formats does it support?",
    answer:
      "The tool supports any plain text input. You can paste code, JSON, configuration files, or simple text documents to see the differences.",
  },
];

export const Route = createFileRoute("/diff-checker")({
  head: () =>
    getSeoMetadata({
      title: "Diff Checker | Compare Text Online | SnapBit Tools",
      description:
        "Easily compare two text files or code snippets side-by-side. 100% private, browser-based diff tool with support for additions and deletions.",
      keywords: [
        "diff checker",
        "text comparison",
        "compare code online",
        "online diff tool",
        "file comparison",
      ],
      url: "/diff-checker",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const diffResult = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);

  const handleClear = () => {
    setOldText("");
    setNewText("");
  };

  const handleSwap = () => {
    setOldText(newText);
    setNewText(oldText);
  };

  const handleCopyResult = () => {
    const textToCopy = diffResult
      .map((line) => {
        const prefix = line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  ";
        return prefix + line.value;
      })
      .join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-100 mb-3">
            Diff <span className="text-brand-primary">Checker</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Pinpoint changes between two text versions instantly. Private, secure, and processing
            entirely in your browser.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === "split"
                  ? "bg-brand-primary shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 text-white"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
              }`}
            >
              <IconColumns className="w-4 h-4" />
              <span className="text-sm font-medium">Split View</span>
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === "unified"
                  ? "bg-brand-primary shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 text-white"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
              }`}
            >
              <IconLayoutList className="w-4 h-4" />
              <span className="text-sm font-medium">Unified View</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSwap}
              title="Swap Inputs"
              className="p-2 text-gray-400 hover:bg-gray-700/50 hover:text-brand-primary rounded-lg transition-all"
            >
              <IconArrowsExchange className="w-5 h-5" />
            </button>
            <button
              onClick={handleClear}
              title="Clear All"
              className="p-2 text-gray-400 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-all"
            >
              <IconTrash className="w-5 h-5" />
            </button>
            <button
              onClick={handleCopyResult}
              disabled={diffResult.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconCopy className="w-4 h-4" />
              <span>{copyStatus || "Copy Diff"}</span>
            </button>
          </div>
        </div>

        {/* Input Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1 uppercase tracking-wider">
              Original Text (Old)
            </label>
            <textarea
              placeholder="Paste your original text here..."
              className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-mono text-sm leading-relaxed"
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1 uppercase tracking-wider">
              Changed Text (New)
            </label>
            <textarea
              placeholder="Paste your modified text here..."
              className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-mono text-sm leading-relaxed"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
          </div>
        </div>

        {/* Diff Visualization */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl mb-12">
          <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Comparison Results
            </h2>
            {diffResult.length > 0 && (
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                  <span className="text-gray-400">
                    {diffResult.filter((l) => l.type === "added").length} added
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                  <span className="text-gray-400">
                    {diffResult.filter((l) => l.type === "removed").length} removed
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {viewMode === "split" ? (
              <SplitView diff={diffResult} />
            ) : (
              <UnifiedView diff={diffResult} />
            )}
          </div>
        </div>

        <ToolInfo
          title="Diff Checker"
          description="Identify exactly what changed between two text snippets. Whether you are comparing code versions, document revisions, or just checking for minor edits, our Diff Checker provides a clear, highlighted visualization of all additions and deletions."
          features={[
            {
              title: "Smart Alignment",
              description:
                "Our algorithm detects shifts and modifications, keeping unchanged parts aligned for easier reading.",
              icon: IconBolt,
            },
            {
              title: "Two View Modes",
              description:
                "Switch between Side-by-Side (Split) view for detailed comparison or Unified view for a linear flow.",
              icon: IconSearch,
            },
            {
              title: "Privacy First",
              description:
                "All text processing happens in your browser. Your data is never uploaded or tracked.",
              icon: IconLock,
            },
          ]}
          steps={[
            {
              title: "Input Text",
              description:
                "Paste your original text in the left panel and the modified version in the right.",
            },
            {
              title: "Choose View",
              description: "Toggle between Split and Unified views based on your preference.",
            },
            {
              title: "Review Changes",
              description: "Look for green highlights for additions and red for deletions.",
            },
            {
              title: "Export Result",
              description: "Use the copy button to grab a formatted version of the differences.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools
        currentToolSlug="diff-checker"
        category="Data"
      />
    </div>
  );
}

function SplitView({ diff }: { diff: DiffLine[] }) {
  if (diff.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-800 min-w-[800px]">
      <div className="font-mono text-sm">
        {diff.map((line, idx) => (
          <div
            key={`left-${idx}`}
            className={`flex items-start ${
              line.type === "removed"
                ? "bg-red-900/20 text-red-200"
                : line.type === "added"
                  ? "invisible pointer-events-none"
                  : "text-gray-400"
            } py-0.5 px-4 min-h-[24px]`}
          >
            <span className="w-8 flex-shrink-0 text-gray-600 select-none text-right mr-4 leading-6">
              {line.oldLineNumber || ""}
            </span>
            <span className="flex-1 whitespace-pre-wrap break-all leading-6">
              {line.type === "added" ? "" : line.value}
            </span>
          </div>
        ))}
      </div>

      {/* Right Panel (New) */}
      <div className="font-mono text-sm">
        {diff.map((line, idx) => (
          <div
            key={`right-${idx}`}
            className={`flex items-start ${
              line.type === "added"
                ? "bg-green-900/20 text-green-200"
                : line.type === "removed"
                  ? "invisible pointer-events-none"
                  : "text-gray-400"
            } py-0.5 px-4 min-h-[24px] border-l border-gray-800`}
          >
            <span className="w-8 flex-shrink-0 text-gray-600 select-none text-right mr-4 leading-6">
              {line.newLineNumber || ""}
            </span>
            <span className="flex-1 whitespace-pre-wrap break-all leading-6">
              {line.type === "removed" ? "" : line.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnifiedView({ diff }: { diff: DiffLine[] }) {
  if (diff.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="font-mono text-sm bg-gray-900 min-w-[600px]">
      {diff.map((line, idx) => (
        <div
          key={`unified-${idx}`}
          className={`flex items-start px-4 py-0.5 ${
            line.type === "added"
              ? "bg-green-900/20 text-green-200"
              : line.type === "removed"
                ? "bg-red-900/20 text-red-200"
                : "text-gray-400"
          }`}
        >
          <div className="flex w-16 flex-shrink-0 select-none text-right mr-4 space-x-2 text-gray-600">
            <span className="w-7">{line.oldLineNumber || ""}</span>
            <span className="w-7">{line.newLineNumber || ""}</span>
          </div>
          <span className="w-4 flex-shrink-0 select-none text-gray-500">
            {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
          </span>
          <span className="flex-1 whitespace-pre-wrap break-all">{line.value}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-gray-500">
      <div className="bg-gray-800 p-4 rounded-full mb-4">
        <IconSearch className="w-8 h-8 opacity-20" />
      </div>
      <p className="text-sm font-medium">Enter text above to see the comparison</p>
    </div>
  );
}
