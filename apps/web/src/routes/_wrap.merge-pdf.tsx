import { IconArrowsSort, IconLock, IconStack2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { MergePdfTool } from "@/components/MergePdfTool";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How does Merge PDF work?",
    answer:
      "SnapBit copies the pages from each PDF you add, in the order you set, into one new PDF. The work happens in your browser. The file is not uploaded.",
  },
  {
    question: "Will the text stay selectable?",
    answer:
      "Yes. Pages are copied, not photographed. Selectable text, images, and the original page size stay in the merged file. Password-protected PDFs are not supported.",
  },
  {
    question: "Can I choose the order?",
    answer: "Drag the files into the order you want before merging. The first file in the list becomes the start of the new PDF.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer: "No. Merging runs on your device. Nothing is sent to SnapBit servers.",
  },
];

export const Route = createFileRoute("/_wrap/merge-pdf")({
  head: () =>
    getSeoMetadata({
      title: "Merge PDF - Combine PDFs Online Free (No Upload)",
      description: "Merge PDF files free in your browser. Reorder documents and download one PDF. Private — no uploads, no signup.",
      keywords: [
        "merge pdf",
        "combine pdf",
        "merge pdf online",
        "merge pdf free",
        "combine pdf files",
        "merge pdf no upload",
        "join pdf",
        "private pdf merge",
        "snapbittools merge pdf",
      ],
      url: "/merge-pdf",
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
              <h1 className="text-2xl sm:text-5xl font-bold text-theme-heading mb-2 tracking-tight text-shadow-sm">Merge PDF</h1>
            </div>
          </div>

          <MergePdfTool />
        </div>
        <ToolContentDisplay
          title={toolContent["merge-pdf"].title}
          intro={toolContent["merge-pdf"].intro}
          benefits={toolContent["merge-pdf"].benefits}
          useCases={toolContent["merge-pdf"].useCases}
        />

        <ToolInfo
          title="Merge PDF"
          description="Combine two or more PDFs into one document on your device. Drag files into order, then download a single PDF with the original pages intact."
          features={[
            {
              title: "Private by Default",
              description: "Merging runs in your browser. No account and no upload.",
              icon: IconLock,
            },
            {
              title: "Your Order",
              description: "Drag PDFs up or down so the merged file follows the sequence you need.",
              icon: IconArrowsSort,
            },
            {
              title: "Real PDF Pages",
              description: "Pages are copied, so text stays selectable and images stay sharp.",
              icon: IconStack2,
            },
          ]}
          steps={[
            { title: "Add PDFs", description: "Drop two or more PDF files, or pick them from your device." },
            { title: "Set the order", description: "Drag each file into the position it should have in the result." },
            { title: "Merge", description: "SnapBit copies every page into one new PDF on your device." },
            { title: "Download", description: "Save the combined PDF when merging finishes." },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="merge-pdf" category="PDF" />
    </div>
  );
}
