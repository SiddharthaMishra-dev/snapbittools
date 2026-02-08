import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import {
  IconTypography,
  IconCopy,
  IconTrash,
  IconCheck,
  IconLetterCaseUpper,
  IconLetterCaseLower,
  IconLetterCase,
  IconClock,
  IconFileText,
  IconHash,
} from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "Is my text saved anywhere when I use the Word Counter?",
    answer:
      "No, never. All calculations are done locally in your browser. Your text is never sent to any server, making this tool completely private and secure for sensitive drafts.",
  },
  {
    question: "How is reading time calculated?",
    answer:
      "We use an average reading speed of 200 words per minute to estimate how long it would take to read your text, providing a helpful metric for content creators and students.",
  },
  {
    question: "Does it count spaces and special characters?",
    answer:
      "Yes, the tool provides both a total character count (including spaces) and a character count without spaces, giving you the detailed metrics needed for platform-specific character limits.",
  },
  {
    question: "Can I use this tool offline?",
    answer:
      "Yes! Since the logic is entirely client-side, once the page is loaded, you can continue to use the Word Counter even without an active internet connection.",
  },
];

export const Route = createFileRoute("/word-counter")({
  head: () =>
    getSeoMetadata({
      title: "Word Counter Online | Character Count & Reading Time | SnapBit Tools",
      description:
        "Count words, characters, and sentences in real-time. Estimate reading time and analyze text density. 100% private and client-side.",
      keywords: [
        "word counter",
        "character count",
        "reading time calculator",
        "text analyzer",
        "offline word count",
      ],
      url: "/word-counter",
      type: "software",
      faqs,
    }),
  component: WordCounterComponent,
});

function WordCounterComponent() {
  const [text, setText] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
    const charactersTotal = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmedText ? (text.match(/[.!?]+($|\s)/g) || []).length : 0;
    const paragraphs = trimmedText
      ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
      : 0;

    const readingTime = Math.ceil(words / 200);

    return {
      words,
      charactersTotal,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
    };
  }, [text]);

  const copyToClipboard = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [text]);

  const clearText = () => setText("");

  const transformText = (type: "upper" | "lower" | "title") => {
    switch (type) {
      case "upper":
        setText(text.toUpperCase());
        break;
      case "lower":
        setText(text.toLowerCase());
        break;
      case "title":
        setText(
          text
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        );
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Word <span className="text-brand-primary">Counter</span>
        </h1>
        <p className="text-md text-gray-200">
          Analyze your text instantly. Count words, characters, sentences and more.
        </p>
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto space-y-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => transformText("upper")}
              disabled={!text}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="UPPERCASE"
            >
              <IconLetterCaseUpper className="w-5 h-5" />
              <span className="hidden sm:inline">UPPERCASE</span>
            </button>
            <button
              onClick={() => transformText("lower")}
              disabled={!text}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="lowercase"
            >
              <IconLetterCaseLower className="w-5 h-5" />
              <span className="hidden sm:inline">lowercase</span>
            </button>
            <button
              onClick={() => transformText("title")}
              disabled={!text}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Title Case"
            >
              <IconLetterCase className="w-5 h-5" />
              <span className="hidden sm:inline">Title Case</span>
            </button>

            <div className="flex-grow md:flex-grow-0" />

            <button
              onClick={copyToClipboard}
              disabled={!text}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                copySuccess
                  ? "bg-green-800 text-green-200"
                  : "bg-brand-primary text-white hover:bg-brand-hover"
              }`}
            >
              {copySuccess ? (
                <>
                  <IconCheck className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <IconCopy className="w-5 h-5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={clearText}
              disabled={!text}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-900 text-red-200 rounded-lg hover:bg-red-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash className="w-5 h-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full flex flex-col">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your content here..."
                className="w-full flex-grow min-h-[400px] p-4 bg-gray-900 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none font-sans text-lg leading-relaxed"
                spellCheck={true}
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-700 pb-2">
                <IconHash className="w-5 h-5 text-brand-primary" />
                Live Statistics
              </h3>

              <div className="space-y-4">
                <StatItem
                  label="Words"
                  value={stats.words}
                  icon={<IconTypography className="w-4 h-4" />}
                />
                <StatItem
                  label="Characters"
                  value={stats.charactersTotal}
                  icon={<IconLetterCase className="w-4 h-4" />}
                />
                <StatItem
                  label="Excl. Spaces"
                  value={stats.charactersNoSpaces}
                  icon={<IconLetterCase className="w-4 h-4" />}
                />
                <StatItem
                  label="Sentences"
                  value={stats.sentences}
                  icon={<IconFileText className="w-4 h-4" />}
                />
                <StatItem
                  label="Paragraphs"
                  value={stats.paragraphs}
                  icon={<IconFileText className="w-4 h-4" />}
                />
                <div className="pt-4 border-t border-gray-700 mt-4">
                  <StatItem
                    label="Reading Time"
                    value={`${stats.readingTime} min`}
                    icon={<IconClock className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            <div className="bg-brand-primary/10 rounded-xl p-6 border border-brand-primary/20">
              <p className="text-sm text-brand-light font-medium italic">
                "Words are, in my not-so-humble opinion, our most inexhaustible source of magic."
              </p>
              <p className="text-xs text-gray-400 mt-2 text-right">— Albus Dumbledore</p>
            </div>
          </div>
        </div>

        <ToolInfo
          title="Word & Character Counter"
          description="A powerful, privacy-first tool designed for writers, editors, and students. Get detailed insights into your writing including word counts, character limits, sentence complexity, and estimated reading time—all processed locally in your browser."
          features={[
            {
              title: "Real-time Metrics",
              description:
                "Counts update instantly as you type, providing immediate feedback on word and character counts.",
              icon: IconHash,
            },
            {
              title: "Text Transformations",
              description:
                "Quickly convert your entire text to UPPERCASE, lowercase, or Title Case with a single click.",
              icon: IconLetterCase,
            },
            {
              title: "Reading Time Estimate",
              description:
                "Plan your content length based on average reading speeds to better engage your audience.",
              icon: IconClock,
            },
          ]}
          steps={[
            {
              title: "Enter Your Text",
              description:
                "Type directly into the editor or paste content from your favorite writing application.",
            },
            {
              title: "Monitor Stats",
              description:
                "Watch the sidebar for real-time updates on words, sentences, and character counts.",
            },
            {
              title: "Format & Edit",
              description:
                "Use the toolbar to transform text case or clear the editor for a fresh start.",
            },
            {
              title: "Copy Content",
              description:
                "Use the Copy button to take your analyzed or transformed text back to your project.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools
        currentToolSlug="word-counter"
        category="Data"
      />

      <footer className="mt-12 text-center">
        <p className="text-gray-400 text-xs">
          Crafted with care by{" "}
          <a
            href="https://sidme.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-hover transition-colors font-medium"
          >
            sidme
          </a>
        </p>
      </footer>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-200 transition-colors">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-100">{value}</span>
    </div>
  );
}
