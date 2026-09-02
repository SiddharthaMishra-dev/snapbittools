import { IconFileTypePdf, IconLock, IconArrowsMinimize } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { PdfCompressorTool } from "@/components/PdfCompressorTool";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How does the PDF compressor work?",
    answer:
      "It renders each page in your browser, re-encodes pages as JPEG at your chosen quality and DPI, then rebuilds a smaller PDF — all on your device. No file is uploaded to a server.",
  },
  {
    question: "Will text stay selectable after compression?",
    answer:
      "Not in the current private (client-side) mode. Pages are rasterized for maximum size reduction. A future optional server mode may preserve text when you consent to upload.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer: "No. Private mode processes the PDF entirely in your browser. Nothing is sent to SnapBit servers.",
  },
  {
    question: "Why didn’t my PDF get smaller?",
    answer:
      "Some PDFs are already optimized. If the compressed output is larger than the original, SnapBit keeps the original and tells you it was already optimized. Try a stronger preset (lower DPI / quality) for image-heavy files.",
  },
  {
    question: "What settings should I use?",
    answer:
      "Balanced (≈100 DPI, ~72% quality) works for most documents. Use Strong for email attachments and High quality when you need sharper screenshots or detailed scans.",
  },
];

export const Route = createFileRoute("/_wrap/pdf-compressor")({
  head: () =>
    getSeoMetadata({
      title: "PDF Compressor - Compress PDF Online Free (No Upload)",
      description:
        "Compress PDF files free in your browser. Shrink image-heavy PDFs with quality and DPI controls. 100% private — no uploads, no signup.",
      keywords: [
        "pdf compressor",
        "compress pdf online",
        "compress pdf free",
        "reduce pdf file size",
        "pdf compressor no upload",
        "client-side pdf compression",
        "shrink pdf online",
        "compress pdf in browser",
        "private pdf compressor",
        "snapbittools pdf compressor",
      ],
      url: "/pdf-compressor",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <div className="text-center mt-6 mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-theme-heading mb-2">
            PDF <span className="text-brand-primary">Compressor</span>
          </h1>
          <p className="text-md text-theme-body">
            Shrink PDF file size in your browser. Private by default — your document never leaves your device.
          </p>
        </div>

        <PdfCompressorTool />

        <ToolContentDisplay
          title={toolContent["pdf-compressor"].title}
          intro={toolContent["pdf-compressor"].intro}
          benefits={toolContent["pdf-compressor"].benefits}
          useCases={toolContent["pdf-compressor"].useCases}
        />

        <ToolInfo
          title="PDF Compressor"
          description="SnapBit’s PDF Compressor reduces file size by re-rendering pages at a chosen DPI and JPEG quality, then rebuilding the PDF locally. Ideal for scans, exports, and sharing — with a clear privacy-first design."
          features={[
            {
              title: "Private by Default",
              description: "Compression runs in your browser. No account and no upload in private mode.",
              icon: IconLock,
            },
            {
              title: "Quality Controls",
              description: "Presets plus custom JPEG quality and DPI so you can balance size and clarity.",
              icon: IconArrowsMinimize,
            },
            {
              title: "Honest Results",
              description: "If compression doesn’t shrink the file, we keep the original and tell you.",
              icon: IconFileTypePdf,
            },
          ]}
          steps={[
            {
              title: "Upload a PDF",
              description: "Drop a PDF or pick a file from your device.",
            },
            {
              title: "Choose a preset",
              description: "Strong, Balanced, or High quality — or fine-tune quality and DPI.",
            },
            {
              title: "Compress",
              description: "Watch page-by-page progress while everything stays on your device.",
            },
            {
              title: "Download",
              description: "Save the smaller PDF when compression finishes.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="pdf-compressor" category="PDF" />
    </div>
  );
}
