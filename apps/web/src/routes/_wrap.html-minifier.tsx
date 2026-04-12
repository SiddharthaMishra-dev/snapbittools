import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  IconCode,
  IconArrowsMinimize,
  IconCopy,
  IconTrash,
  IconCheck,
  IconDownload,
  IconSparkles,
  IconShieldLock,
  IconBolt,
} from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";

const faqs = [
  {
    question: "Is this HTML minifier private?",
    answer:
      "Yes. The tool runs entirely in your browser. Your HTML is never uploaded to any server, so you can minify sensitive templates with full privacy.",
  },
  {
    question: "Does it remove HTML comments?",
    answer: "By default, yes. You can turn comment removal on or off at any time before minifying.",
  },
  {
    question: "Will it break <script>, <style>, or <pre> blocks?",
    answer: "No. The tool preserves content inside script, style, pre, and textarea blocks while minifying the surrounding HTML.",
  },
  {
    question: "Can I minify and de-minify HTML here?",
    answer: "Yes. You can generate either minified or de-minified output, then copy it or download it as an .html file instantly.",
  },
];

export const Route = createFileRoute("/_wrap/html-minifier")({
  head: () =>
    getSeoMetadata({
      title: "HTML Minifier Online | Minify HTML Code Instantly | SnapBit Tools",
      description:
        "Minify HTML code instantly by removing comments and extra whitespace. 100% private, browser-based, and works without uploads.",
      keywords: ["html minifier", "minify html", "compress html", "html optimizer", "remove html comments"],
      url: "/html-minifier",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputMode, setOutputMode] = useState<"minified" | "deminified">("minified");
  const [copySuccess, setCopySuccess] = useState(false);
  const [removeComments, setRemoveComments] = useState(true);
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);

  const minifyHtml = useCallback(
    (source: string) => {
      let minified = source.replace(/\r\n/g, "\n");

      const protectedBlocks: string[] = [];
      minified = minified.replace(/<(script|style|pre|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
        const marker = `___SNAPBIT_BLOCK_${protectedBlocks.length}___`;
        protectedBlocks.push(match);
        return marker;
      });

      if (removeComments) {
        minified = minified.replace(/<!--[\s\S]*?-->/g, (comment) => {
          const isConditional = /<!--\s*\[if[\s\S]*?\]>[\s\S]*?<!\[endif\]\s*-->/i.test(comment);
          return isConditional ? comment : "";
        });
      }

      if (collapseWhitespace) {
        minified = minified.replace(/\s{2,}/g, " ");
        minified = minified.replace(/>\s+</g, "><");
        minified = minified.replace(/\s+(\/?>)/g, "$1");
      }

      minified = minified.trim();

      minified = minified.replace(/___SNAPBIT_BLOCK_(\d+)___/g, (_, index) => protectedBlocks[Number(index)] ?? "");

      return minified;
    },
    [removeComments, collapseWhitespace],
  );

  const deminifyHtml = useCallback((source: string) => {
    const voidTags = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    let html = source.replace(/\r\n/g, "\n").replace(/>\s+</g, "><").trim();

    const protectedBlocks: string[] = [];
    html = html.replace(/<(script|style|pre|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
      const marker = `___SNAPBIT_FORMAT_BLOCK_${protectedBlocks.length}___`;
      protectedBlocks.push(match);
      return marker;
    });

    html = html.replace(/(>)(<)(\/?)/g, "$1\n$2$3");
    const lines = html
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let indentLevel = 0;
    const formatted: string[] = [];

    for (const line of lines) {
      const isClosingTag = /^<\/[^>]+>$/.test(line);
      const openingMatch = line.match(/^<([a-zA-Z0-9-:]+)/);
      const tagName = openingMatch?.[1]?.toLowerCase();
      const isComment = /^<!--/.test(line);
      const isDeclaration = /^<![^-]/.test(line) || /^<\?/.test(line);
      const isSelfClosing = /\/>$/.test(line) || (!!tagName && voidTags.has(tagName));
      const hasInlineClosing = !!tagName && new RegExp(`</${tagName}>$`, "i").test(line);
      const shouldIncreaseIndent = !!tagName && !isSelfClosing && !hasInlineClosing && !isClosingTag;

      if (isClosingTag) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      const currentIndent = "  ".repeat(indentLevel);
      formatted.push(`${currentIndent}${line}`);

      if (shouldIncreaseIndent && !isComment && !isDeclaration) {
        indentLevel += 1;
      }
    }

    return formatted
      .join("\n")
      .replace(/___SNAPBIT_FORMAT_BLOCK_(\d+)___/g, (_, index) => protectedBlocks[Number(index)] ?? "")
      .trim();
  }, []);

  const originalBytes = useMemo(() => new Blob([input]).size, [input]);
  const outputBytes = useMemo(() => new Blob([output]).size, [output]);

  const savings = useMemo(() => {
    if (!input || !output || originalBytes === 0) return 0;
    return Math.max(0, Math.round(((originalBytes - outputBytes) / originalBytes) * 100));
  }, [input, output, originalBytes, outputBytes]);

  const handleMinify = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutputMode("minified");
    setOutput(minifyHtml(input));
  };

  const handleDeminify = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutputMode("deminified");
    setOutput(deminifyHtml(input));
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setOutputMode("minified");
    setCopySuccess(false);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert("Failed to copy the minified HTML.");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = outputMode === "minified" ? "minified.html" : "deminified.html";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-2 px-4 flex flex-col">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        {/* <Breadcrumbs /> */}

        <div className="text-center mt-6 mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-100 mb-2">
            HTML <span className="text-brand-primary">Minifier</span>
          </h1>
          <p className="text-md text-gray-300">Minify HTML instantly by removing comments and unnecessary spaces in a private workflow.</p>
        </div>

        <main className="flex-1 max-w-7xl w-full mx-auto space-y-6">
          <section className="rounded-2xl border border-gray-700/50 bg-gray-800/20 p-4 sm:p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-200 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={removeComments}
                    onChange={(e) => setRemoveComments(e.target.checked)}
                    className="accent-brand-primary"
                  />
                  Remove comments
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-200 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={collapseWhitespace}
                    onChange={(e) => setCollapseWhitespace(e.target.checked)}
                    className="accent-brand-primary"
                  />
                  Collapse whitespace
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleMinify}
                  disabled={!input.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconArrowsMinimize className="w-4 h-4" />
                  Minify
                </button>
                <button
                  onClick={handleDeminify}
                  disabled={!input.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconSparkles className="w-4 h-4" />
                  De-minify
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconDownload className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleClear}
                  disabled={!input && !output}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-900 text-red-200 rounded-lg font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconTrash className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div className="rounded-xl ">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                    <IconCode className="w-5 h-5 text-brand-primary" />
                    Input HTML
                  </h2>
                  <span className="text-xs text-gray-400">{originalBytes.toLocaleString()} bytes</span>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your HTML markup here..."
                  className="w-full min-h-[260px] p-4 bg-gray-950 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono text-sm resize-y"
                  spellCheck={false}
                />
              </div>

              <div className="rounded-xl ">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                    <IconSparkles className="w-5 h-5 text-brand-primary" />
                    {outputMode === "minified" ? "Minified Output" : "De-minified Output"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{outputBytes.toLocaleString()} bytes</span>
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        copySuccess ? "bg-green-800 text-green-200" : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                      }`}
                    >
                      {copySuccess ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
                      {copySuccess ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <textarea
                  value={output}
                  readOnly
                  placeholder="Processed HTML output will appear here..."
                  className="w-full min-h-[260px] p-4 bg-gray-950 text-gray-100 rounded-lg border border-gray-700 focus:outline-none font-mono text-sm resize-y"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Original Size" value={`${originalBytes.toLocaleString()} bytes`} icon={<IconCode className="w-4 h-4" />} />
              <StatCard
                title={outputMode === "minified" ? "Minified Size" : "De-minified Size"}
                value={`${outputBytes.toLocaleString()} bytes`}
                icon={outputMode === "minified" ? <IconArrowsMinimize className="w-4 h-4" /> : <IconSparkles className="w-4 h-4" />}
              />
              <StatCard title="Saved" value={`${savings}%`} icon={<IconBolt className="w-4 h-4" />} highlight />

              <div className="col-span-3 bg-gray-700/20 border border-gray-700/50 rounded-lg p-3  flex items-start gap-3">
                <IconShieldLock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold ">100% Private Processing</p>
                  <p className="mt-1 text-gray-400">Everything runs locally in your browser. Your HTML never leaves your device.</p>
                </div>
              </div>
            </div>
          </section>

          <ToolContentDisplay
            title={toolContent["html-minifier"].title}
            intro={toolContent["html-minifier"].intro}
            benefits={toolContent["html-minifier"].benefits}
            useCases={toolContent["html-minifier"].useCases}
          />

          <ToolInfo
            title="HTML Minification for Faster Delivery"
            description="Reduce HTML payload size and clean up markup for production without leaving your browser. Great for landing pages, templates, static sites, and email markup workflows."
            features={[
              {
                title: "Comment Removal",
                description: "Strip non-essential HTML comments to reduce file size before deployment.",
                icon: IconTrash,
              },
              {
                title: "Whitespace Optimization",
                description: "Collapse redundant spacing between elements for compact, clean output.",
                icon: IconArrowsMinimize,
              },
              {
                title: "Readable De-minify",
                description: "Expand compact HTML into a structured, readable format for debugging and reviews.",
                icon: IconSparkles,
              },
              {
                title: "Private by Default",
                description: "All minification happens locally with no uploads, logs, or backend processing.",
                icon: IconShieldLock,
              },
            ]}
            steps={[
              {
                title: "Paste HTML",
                description: "Add your raw HTML code into the input panel.",
              },
              {
                title: "Set Options",
                description: "Toggle comment removal and whitespace collapsing based on your needs.",
              },
              {
                title: "Minify or De-minify",
                description: "Generate compact HTML for production or readable HTML for editing and debugging.",
              },
              {
                title: "Copy or Download",
                description: "Copy the minified result or download a production-ready .html file.",
              },
            ]}
            privacyInfo="All HTML processing is fully client-side. Nothing is uploaded or stored."
            faqs={faqs}
          />

          <RelatedTools currentToolSlug="html-minifier" category="Data" />

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
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight = false }: { title: string; value: string; icon: ReactNode; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? "border-brand-primary/40 bg-brand-primary/10" : "border-gray-700 bg-gray-900/60"}`}
    >
      <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">{title}</div>
      <div className="flex items-center justify-between">
        <span className={`text-lg font-bold ${highlight ? "text-brand-light" : "text-gray-100"}`}>{value}</span>
        <span className={`shrink-0 ${highlight ? "text-brand-primary" : "text-gray-400"}`}>{icon}</span>
      </div>
    </div>
  );
}
