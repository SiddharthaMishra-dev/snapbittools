import { createFileRoute } from "@tanstack/react-router";
import { IconBraces, IconArrowsMinimize, IconDownload } from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonFormatterTool } from "@/components/JsonFormatterTool";

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
      title: "JSON Formatter & Validator | Beautify JSON | SnapBit Tools",
      description:
        "Format, validate, and minify JSON strings instantly. Privacy-focused, 100% client-side, and works offline.",
      keywords: ["json formatter", "json validator", "beautify json", "minify json", "json editor"],
      url: "/json-formatter",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <Breadcrumbs />

        {/* Header */}
        <div className="text-center mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            JSON <span className="text-blue-400">Formatter</span>
          </h1>
          <p className="text-md text-gray-200">
            Format, validate & minify JSON instantly. No data sent to servers—completely private.
          </p>
        </div>

        <JsonFormatterTool />

        {/* Content Display */}
        <div className="max-w-7xl mx-auto mb-16 w-full">
          <ToolContentDisplay
            title={toolContent["json-formatter"].title}
            intro={toolContent["json-formatter"].intro}
            benefits={toolContent["json-formatter"].benefits}
            useCases={toolContent["json-formatter"].useCases}
          />
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
    </div>
  );
}
