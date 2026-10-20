import { IconArrowsSort, IconLock, IconTrash } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { OrganizePdfTool } from "@/components/OrganizePdfTool";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How do I reorder and delete PDF pages?",
    answer:
      "Upload a PDF, drag the page previews into a new order, and delete any page you do not want. Download saves a new PDF with only the pages you kept, in that order.",
  },
  {
    question: "Do the previews replace the original pages?",
    answer:
      "No. Previews are only for the grid. The download copies the original PDF pages, so text stays selectable and images stay at their original quality.",
  },
  {
    question: "Can I undo a delete?",
    answer:
      "Reset puts every original page back in its starting order until you remove the file or download. The download itself only includes the pages still on screen.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer: "No. Reordering runs on your device. Nothing is sent to SnapBit servers. Password-protected PDFs are not supported.",
  },
];

export const Route = createFileRoute("/_wrap/reorder-pdf")({
  head: () =>
    getSeoMetadata({
      title: "Reorder PDF Pages - Delete and Rearrange PDF Online (No Upload)",
      description:
        "Reorder and delete PDF pages free in your browser. Drag pages into a new order and download the PDF. Private — no uploads, no signup.",
      keywords: [
        "reorder pdf pages",
        "rearrange pdf pages",
        "delete pdf pages",
        "remove pages from pdf",
        "organize pdf",
        "reorder pdf no upload",
        "pdf page organizer",
        "private pdf editor",
        "snapbittools reorder pdf",
      ],
      url: "/reorder-pdf",
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
              <h1 className="text-2xl sm:text-5xl font-bold text-theme-heading mb-2 tracking-tight text-shadow-sm">Reorder PDF</h1>
            </div>
          </div>

          <OrganizePdfTool />
        </div>
        <ToolContentDisplay
          title={toolContent["reorder-pdf"].title}
          intro={toolContent["reorder-pdf"].intro}
          benefits={toolContent["reorder-pdf"].benefits}
          useCases={toolContent["reorder-pdf"].useCases}
        />

        <ToolInfo
          title="Reorder PDF"
          description="Rearrange pages and delete the ones you do not need, then download a new PDF. Previews help you see the order; the file itself stays a real PDF."
          features={[
            {
              title: "Private by Default",
              description: "Reordering runs in your browser. No account and no upload.",
              icon: IconLock,
            },
            {
              title: "Drag or Use Arrows",
              description: "Move pages by dragging the preview, or step them earlier and later with the arrows.",
              icon: IconArrowsSort,
            },
            {
              title: "Delete Pages",
              description: "Remove any page you do not want. Reset restores the original order before you download.",
              icon: IconTrash,
            },
          ]}
          steps={[
            { title: "Upload a PDF", description: "Drop a PDF or pick one from your device." },
            { title: "Reorder", description: "Drag previews, or use the arrows, until the pages sit in the right order." },
            { title: "Delete", description: "Remove pages you do not want to keep. At least one page has to stay." },
            { title: "Download", description: "Save a new PDF that contains only the remaining pages, in that order." },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="reorder-pdf" category="PDF" />
    </div>
  );
}
