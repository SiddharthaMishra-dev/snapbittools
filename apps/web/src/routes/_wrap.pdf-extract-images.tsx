import { IconFileZip, IconLock, IconPhotoDown } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { PdfExtractImagesTool } from "@/components/PdfExtractImagesTool";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How is this different from PDF to JPG?",
    answer:
      "PDF to JPG takes a picture of every page, including text and layout. This tool pulls out photos that are already stored inside the PDF — logos, scans, and pictures — then packs them into a ZIP.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer: "No. Extraction runs entirely on your device. SnapBit never receives the file.",
  },
  {
    question: "Why were some images skipped?",
    answer:
      "Tiny decorative images under 16×16 pixels are ignored so you get photos, not bullets or background tiles. The same picture reused on several pages is only saved once.",
  },
  {
    question: "What if no photos are found?",
    answer:
      "Text-only PDFs and vector drawings don’t contain extractable photos. Use PDF to JPG if you need a picture of each page instead.",
  },
  {
    question: "What format are the photos?",
    answer: "Each extracted photo is saved as a PNG inside a ZIP named after your PDF. You can also download photos one at a time.",
  },
];

export const Route = createFileRoute("/_wrap/pdf-extract-images")({
  head: () =>
    getSeoMetadata({
      title: "Extract Images from PDF - Download Photos as ZIP (No Upload)",
      description:
        "Extract photos from a PDF in your browser and download them as a ZIP. Private, no upload. See how many images were found.",
      keywords: [
        "extract images from pdf",
        "pdf extract photos",
        "pdf image extractor",
        "download images from pdf",
        "pdf to zip images",
        "extract photos from pdf online",
        "pdf image extractor no upload",
        "save pdf pictures",
        "pdf embedded images",
        "private pdf image extractor",
        "snapbittools pdf extract images",
      ],
      url: "/pdf-extract-images",
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
            Extract PDF <span className="text-brand-primary">Photos</span>
          </h1>
          <p className="text-md text-theme-body">
            Pull photos out of a PDF in your browser, then download them as a ZIP. Your file never leaves your device.
          </p>
        </div>

        <PdfExtractImagesTool />

        <ToolContentDisplay
          title={toolContent["pdf-extract-images"].title}
          intro={toolContent["pdf-extract-images"].intro}
          benefits={toolContent["pdf-extract-images"].benefits}
          useCases={toolContent["pdf-extract-images"].useCases}
        />

        <ToolInfo
          title="PDF Image Extractor"
          description="SnapBit’s PDF image extractor finds embedded photos with PDF.js, saves them as PNG files, and packs them into a ZIP — all in your browser. You see how many photos were found before you download."
          features={[
            {
              title: "Private by Default",
              description: "The PDF is scanned on your device. No account and no upload.",
              icon: IconLock,
            },
            {
              title: "Photo count",
              description: "See exactly how many photos were extracted, with previews of each one.",
              icon: IconPhotoDown,
            },
            {
              title: "ZIP download",
              description: "Download every photo in one ZIP, or save individual PNGs from the grid.",
              icon: IconFileZip,
            },
          ]}
          steps={[
            {
              title: "Upload a PDF",
              description: "Drop a PDF or pick a file from your device.",
            },
            {
              title: "Wait for the scan",
              description: "Each page is checked for embedded photos. Duplicates and tiny icons are skipped.",
            },
            {
              title: "Review the count",
              description: "See how many photos were found and preview them.",
            },
            {
              title: "Download the ZIP",
              description: "Save all photos in one archive, or download a single PNG.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="pdf-extract-images" category="PDF" />
    </div>
  );
}
