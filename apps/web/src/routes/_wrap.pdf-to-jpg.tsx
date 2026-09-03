import { IconFileTypeJpg, IconLock, IconPhoto } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { PdfToJpgTool } from "@/components/PdfToJpgTool";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How does PDF to JPG conversion work?",
    answer:
      "Each page is rendered in your browser with PDF.js, drawn onto a canvas, and saved as a JPG (or PNG). Nothing is uploaded. You pick DPI and JPEG quality before converting.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer: "No. Conversion runs entirely on your device. SnapBit never receives the file.",
  },
  {
    question: "Can I convert a multi-page PDF?",
    answer: "Yes. Every page becomes its own image. Download pages individually or grab a ZIP of the whole set.",
  },
  {
    question: "JPG or PNG — which should I use?",
    answer:
      "JPG is smaller and ideal for scans, photos, and sharing. PNG is lossless and keeps text and diagrams sharper, at a larger file size.",
  },
  {
    question: "Why doesn’t the text stay selectable?",
    answer: "A JPG is a picture of the page, not a document. If you need selectable text, keep the original PDF or use a PDF editor.",
  },
  {
    question: "What DPI should I choose?",
    answer:
      "150 DPI (Screen) is the default and looks sharp on monitors. Use 72 DPI for small attachments and 300 DPI when you need print-like detail.",
  },
];

export const Route = createFileRoute("/_wrap/pdf-to-jpg")({
  head: () =>
    getSeoMetadata({
      title: "PDF to JPG Converter - Convert PDF to Image Online Free (No Upload)",
      description:
        "Convert PDF pages to JPG or PNG in your browser. Private, no upload. Download each page or a ZIP. Free PDF to image converter.",
      keywords: [
        "pdf to jpg",
        "pdf to jpeg",
        "pdf to png",
        "pdf to image",
        "convert pdf to jpg",
        "pdf to jpg online",
        "pdf to jpg no upload",
        "pdf page to image",
        "convert pdf pages to jpg",
        "pdf to jpg free",
        "client-side pdf to jpg",
        "private pdf to image converter",
        "snapbittools pdf to jpg",
      ],
      url: "/pdf-to-jpg",
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
            PDF to <span className="text-brand-primary">JPG</span>
          </h1>
          <p className="text-md text-theme-body">
            Turn PDF pages into JPG or PNG images in your browser. Private by default — your document never leaves your device.
          </p>
        </div>

        <PdfToJpgTool />

        <ToolContentDisplay
          title={toolContent["pdf-to-jpg"].title}
          intro={toolContent["pdf-to-jpg"].intro}
          benefits={toolContent["pdf-to-jpg"].benefits}
          useCases={toolContent["pdf-to-jpg"].useCases}
        />

        <ToolInfo
          title="PDF to JPG Converter"
          description="SnapBit’s PDF to JPG converter rasterizes each page locally with PDF.js, then downloads JPG or PNG images. Ideal for sharing scans, posting a single page, or extracting slides — without uploading the file."
          features={[
            {
              title: "Private by Default",
              description: "Pages are rendered in your browser. No account and no upload.",
              icon: IconLock,
            },
            {
              title: "JPG or PNG",
              description: "JPEG for smaller shares, PNG when you need sharper text and diagrams.",
              icon: IconFileTypeJpg,
            },
            {
              title: "Every Page, or a ZIP",
              description: "Preview thumbnails, download one page, or save the whole PDF as a ZIP of images.",
              icon: IconPhoto,
            },
          ]}
          steps={[
            {
              title: "Upload a PDF",
              description: "Drop a PDF or pick a file from your device.",
            },
            {
              title: "Choose format and DPI",
              description: "JPG or PNG, then Web (72), Screen (150), or Print (300) DPI.",
            },
            {
              title: "Convert",
              description: "Watch page-by-page progress while everything stays on your device.",
            },
            {
              title: "Download",
              description: "Save individual images or a ZIP of every page.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="pdf-to-jpg" category="PDF" />
    </div>
  );
}
