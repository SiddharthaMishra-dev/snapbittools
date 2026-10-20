import { IconFileTypePdf, IconLock, IconScissors } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import RelatedTools from "@/components/RelatedTools";
import { SplitPdfTool } from "@/components/SplitPdfTool";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How does Split PDF work?",
    answer:
      "You can download every page as its own PDF, or split the document into two PDFs after a page you choose. Both options download a ZIP. Processing stays in your browser.",
  },
  {
    question: "Will each file still have real text?",
    answer:
      "Yes. Each new PDF is a copy of the original pages, not a screenshot. Selectable text and images are kept. Password-protected PDFs are not supported.",
  },
  {
    question: "What do I download?",
    answer:
      "Every page produces a ZIP named after your file, with one PDF per page. Splitting in two produces a ZIP with part 1 and part 2.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer: "No. Splitting runs on your device. Nothing is sent to SnapBit servers.",
  },
];

export const Route = createFileRoute("/_wrap/split-pdf")({
  head: () =>
    getSeoMetadata({
      title: "Split PDF - Separate PDF Pages Online Free (No Upload)",
      description:
        "Split a PDF free in your browser. Save every page as its own PDF, or cut the file into two PDFs. Private — no uploads, no signup.",
      keywords: [
        "split pdf",
        "split pdf pages",
        "separate pdf pages",
        "split pdf online",
        "pdf page extractor",
        "split pdf no upload",
        "extract pdf pages",
        "private pdf split",
        "snapbittools split pdf",
      ],
      url: "/split-pdf",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-theme-page theme-page-gradient py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl mt-6 mb-12 text-center mx-auto">
            <div className="text-center">
              <h1 className="text-2xl sm:text-5xl font-bold text-theme-heading mb-2 tracking-tight text-shadow-sm">Split PDF</h1>
            </div>
          </div>

          <SplitPdfTool />
        </div>
        <ToolContentDisplay
          title={toolContent["split-pdf"].title}
          intro={toolContent["split-pdf"].intro}
          benefits={toolContent["split-pdf"].benefits}
          useCases={toolContent["split-pdf"].useCases}
        />

        <ToolInfo
          title="Split PDF"
          description="Separate one PDF into individual pages, or cut it into two files after any page. Downloads are ZIP archives built on your device."
          features={[
            {
              title: "Private by Default",
              description: "Splitting runs in your browser. No account and no upload.",
              icon: IconLock,
            },
            {
              title: "Two Ways to Split",
              description: "Save every page, or choose the page where the document should break in two.",
              icon: IconScissors,
            },
            {
              title: "Real PDF Pages",
              description: "Each output is a copy of the original pages, so text stays selectable.",
              icon: IconFileTypePdf,
            },
          ]}
          steps={[
            { title: "Upload a PDF", description: "Drop a multi-page PDF or pick one from your device." },
            { title: "Choose a split", description: "Download every page, or set the page to split after." },
            { title: "Wait on your device", description: "SnapBit copies the pages locally and packs them into a ZIP." },
            { title: "Download", description: "Save the ZIP of PDFs when the split finishes." },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="split-pdf" category="PDF" />
    </div>
  );
}
