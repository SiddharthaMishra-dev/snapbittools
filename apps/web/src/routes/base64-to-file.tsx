import { IconBolt, IconCheck, IconDownload, IconFileCode, IconLock } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, easeInOut } from "motion/react";
import React, { useMemo, useState } from "react";

import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "Can this decode any Base64 content type?",
    answer:
      "Yes. You can decode Base64 for text files, images, PDFs, Office documents, ZIP files, and most other binary formats. If your input includes a Data URI (data:mime/type;base64,...), the tool will auto-detect the MIME type.",
  },
  {
    question: "Do my Base64 data or files leave my device?",
    answer:
      "No. Everything runs in your browser only. Your Base64 input is decoded locally and never uploaded to any server.",
  },
  {
    question: "Can I decode raw Base64 without data: prefix?",
    answer:
      "Yes. Paste either raw Base64 or full Data URI strings. Raw Base64 works with optional manual MIME type input.",
  },
  {
    question: "Why does the downloaded file open incorrectly?",
    answer:
      "Most often this means MIME type or file extension is mismatched. Try setting the correct MIME type (for example image/png, application/pdf, text/plain) and decode again.",
  },
];

const MIME_TO_EXTENSION: Record<string, string> = {
  "text/plain": "txt",
  "text/csv": "csv",
  "text/html": "html",
  "application/json": "json",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/xml": "xml",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "audio/mpeg": "mp3",
  "video/mp4": "mp4",
};

export const Route = createFileRoute("/base64-to-file")({
  head: () =>
    getSeoMetadata({
      title: "Base64 to File Converter | Decode Any Base64 to Original File",
      description:
        "Decode Base64 to original files instantly in your browser. Supports text, image, PDF, Excel, Word, ZIP, and more with zero uploads.",
      keywords: [
        "base64 to file",
        "decode base64",
        "base64 decoder",
        "base64 to pdf",
        "base64 to image",
        "base64 to excel",
        "data uri decoder",
        "browser base64 converter",
      ],
      url: "/base64-to-file",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

type DecodedResult = {
  detectedMime: string;
  finalMime: string;
  fileName: string;
  size: number;
  url: string;
};

function decodeBase64Input(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Please paste a Base64 string.");
  }

  let detectedMime = "";
  let base64Payload = trimmed;

  const dataUriMatch = trimmed.match(/^data:([^;,]+)?(?:;[^;,=]+=[^;,]+)*;base64,(.*)$/is);
  if (dataUriMatch) {
    detectedMime = dataUriMatch[1] || "";
    base64Payload = dataUriMatch[2] || "";
  }

  const normalizedPayload = base64Payload.replace(/\s+/g, "");

  if (normalizedPayload.length === 0) {
    throw new Error("Base64 payload is empty.");
  }

  try {
    const binary = atob(normalizedPayload);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return { detectedMime, bytes };
  } catch {
    throw new Error("Invalid Base64 input. Please verify the content and try again.");
  }
}

function resolveExtensionFromMime(mime: string) {
  const normalized = mime.toLowerCase();
  if (MIME_TO_EXTENSION[normalized]) {
    return MIME_TO_EXTENSION[normalized];
  }

  if (normalized.includes("/")) {
    return normalized.split("/")[1].split("+")[0] || "bin";
  }

  return "bin";
}

function ensureFileName(baseName: string, extension: string) {
  const safeBase = baseName.trim() || "decoded-file";

  if (/\.[a-z0-9]{1,10}$/i.test(safeBase)) {
    return safeBase;
  }

  return `${safeBase}.${extension}`;
}

function RouteComponent() {
  const [base64Input, setBase64Input] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [fileBaseName, setFileBaseName] = useState("decoded-file");
  const [result, setResult] = useState<DecodedResult | null>(null);
  const [error, setError] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: easeInOut,
      },
    },
  };

  const clearResultUrl = React.useCallback(() => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
  }, [result]);

  React.useEffect(() => {
    return () => {
      clearResultUrl();
    };
  }, [clearResultUrl]);

  const suggestedMime = useMemo(() => {
    if (result?.detectedMime) {
      return result.detectedMime;
    }
    return "";
  }, [result]);

  const handleDecode = () => {
    try {
      clearResultUrl();
      setError("");

      const { detectedMime, bytes } = decodeBase64Input(base64Input);
      const resolvedMime = mimeType.trim() || detectedMime || "application/octet-stream";
      const extension = resolveExtensionFromMime(resolvedMime);
      const fullFileName = ensureFileName(fileBaseName, extension);
      const blob = new Blob([bytes], { type: resolvedMime });
      const url = URL.createObjectURL(blob);

      setResult({
        detectedMime,
        finalMime: resolvedMime,
        fileName: fullFileName,
        size: bytes.byteLength,
        url,
      });
    } catch (decodeError) {
      setResult(null);
      setError(decodeError instanceof Error ? decodeError.message : "Failed to decode Base64 input.");
    }
  };

  const handleClear = () => {
    clearResultUrl();
    setBase64Input("");
    setMimeType("");
    setFileBaseName("decoded-file");
    setResult(null);
    setError("");
  };

  const handleDownload = () => {
    if (!result) {
      return;
    }

    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <Breadcrumbs />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-5xl mt-6 mb-10 text-center mx-auto">
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-100 mb-2">
              Base64 to <span className="text-brand-primary">File</span> Decoder
            </h1>
            <p className="text-md text-gray-300">Decode any Base64 string back to its original file format. 100% private in-browser.</p>
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-5xl mx-auto mb-8">
          <motion.div variants={itemVariants} className="rounded-xl shadow-lg bg-gray-800/40 border border-gray-700 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="file-base-name" className="block text-sm font-medium text-gray-300 mb-2">
                  File name
                </label>
                <input
                  id="file-base-name"
                  type="text"
                  value={fileBaseName}
                  onChange={(event) => setFileBaseName(event.target.value)}
                  placeholder="decoded-file"
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800/60 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label htmlFor="mime-type" className="block text-sm font-medium text-gray-300 mb-2">
                  MIME type (optional)
                </label>
                <input
                  id="mime-type"
                  type="text"
                  value={mimeType}
                  onChange={(event) => setMimeType(event.target.value)}
                  placeholder={suggestedMime || "application/pdf or image/png"}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800/60 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <label htmlFor="base64-input" className="block text-sm font-medium text-gray-300 mb-2">
              Paste Base64 or Data URI
            </label>
            <textarea
              id="base64-input"
              value={base64Input}
              onChange={(event) => setBase64Input(event.target.value)}
              rows={10}
              placeholder="data:application/pdf;base64,JVBERi0xLjQKJ... or raw Base64"
              className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDecode}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors duration-200 font-medium"
              >
                Decode Base64
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Clear
              </button>
            </div>
          </motion.div>

          {result && (
            <motion.div variants={resultVariants} initial="hidden" animate="visible" className="mt-6 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">Decoded file is ready</h3>
                  <p className="text-sm text-gray-300 mt-1">{result.fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-green-100 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
                >
                  <IconDownload className="w-4 h-4" />
                  Download file
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400">Detected MIME</p>
                  <p className="text-gray-100 font-medium break-all">{result.detectedMime || "Not found in input"}</p>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                  <p className="text-gray-400">Output MIME</p>
                  <p className="text-gray-100 font-medium break-all">{result.finalMime}</p>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700 sm:col-span-2">
                  <p className="text-gray-400">File size</p>
                  <p className="text-gray-100 font-medium">{result.size.toLocaleString()} bytes</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.p variants={itemVariants} className="text-center text-gray-400 text-xs mt-4">
            Privacy note: decoding happens entirely in your browser. Your data is never uploaded.
          </motion.p>
        </motion.div>

        <ToolContentDisplay
          title={toolContent["base64-to-file"].title}
          intro={toolContent["base64-to-file"].intro}
          benefits={toolContent["base64-to-file"].benefits}
          useCases={toolContent["base64-to-file"].useCases}
        />

        <ToolInfo
          title="Base64 to File"
          description="Convert Base64 strings back into original downloadable files directly in your browser. Supports Data URI input and raw Base64 for documents, media files, spreadsheets, and more."
          features={[
            {
              title: "Works for Any File Type",
              description: "Decode Base64 content into text files, images, PDFs, Office files, archives, and other binary formats.",
              icon: IconFileCode,
            },
            {
              title: "Private by Design",
              description: "All decoding happens locally in your browser. No input leaves your device.",
              icon: IconLock,
            },
            {
              title: "Instant Download",
              description: "After decoding, download the recovered file immediately with one click.",
              icon: IconBolt,
            },
          ]}
          steps={[
            {
              title: "Paste Base64 Input",
              description: "Paste raw Base64 or a full Data URI string into the input box.",
            },
            {
              title: "Set File Details",
              description: "Optionally provide MIME type and file name to ensure correct extension handling.",
            },
            {
              title: "Decode",
              description: "Click Decode Base64 to process the content into binary data.",
            },
            {
              title: "Download",
              description: "Download the decoded file to your device.",
            },
          ]}
          faqs={faqs}
        />

        <RelatedTools currentToolSlug="base64-to-file" category="Data" />

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs text-center">
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
        </div>
      </div>
    </div>
  );
}
