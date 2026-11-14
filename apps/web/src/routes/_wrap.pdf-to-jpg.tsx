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
    question: "How does this PDF to JPG converter work?",
    answer:
      "Each page is rendered in your browser with PDF.js, drawn onto a canvas, and saved as a JPG (JPEG) or PNG image. Nothing is uploaded. You pick DPI and JPEG quality before converting.",
  },
  {
    question: "Is this PDF to JPG converter free and online?",
    answer:
      "Yes. It is a free PDF to JPG converter that runs online in any modern browser, with no signup, no watermarks, and no page limits. Despite being online, your PDF is never uploaded — conversion happens on your device.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer: "No. Conversion runs entirely on your device. SnapBit never receives the file.",
  },
  {
    question: "Can I bulk convert a multi-page PDF to JPG?",
    answer:
      "Yes. Every page is converted in one pass and becomes its own image. Download pages individually or grab a ZIP of the whole set — no need to export pages one at a time.",
  },
  {
    question: "How do I get the best quality PDF to JPG output?",
    answer:
      "Choose Print (300 DPI) and set JPEG quality to 90–100%. For text-heavy pages, diagrams, or line art, pick PNG for lossless, crisp edges. Higher DPI and quality produce larger files.",
  },
  {
    question: "Is JPG the same as JPEG?",
    answer:
      "Yes. JPG and JPEG are the same image format — only the file extension differs. Images from this tool are saved with the .jpg extension and open in every photo viewer, editor, and app.",
  },
  {
    question: "JPG or PNG — which should I use?",
    answer:
      "JPG is smaller and ideal for scans, photos, and sharing. PNG is lossless and keeps text and diagrams sharper, at a larger file size.",
  },
  {
    question: "Do I need Adobe Acrobat or a desktop app to convert PDF to JPG?",
    answer:
      "No. Adobe Acrobat and other PDF apps can export pages as images, but SnapBit does it in the browser with nothing to install and no subscription. It works on Windows, macOS, Linux, Android, and iPhone.",
  },
  {
    question: "Can I edit the PDF before converting it to JPG?",
    answer:
      "This is a converter, not a PDF editor. To reorder or remove pages first, use Reorder PDF, then convert. Once you have JPGs, you can crop, resize, or compress them with any image editor or SnapBit’s image tools.",
  },
  {
    question: "Why doesn’t the text stay selectable?",
    answer:
      "A JPG is a picture of the page, not a document. If you need selectable text, keep the original PDF or use a PDF editor.",
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
      title: "Free PDF to JPG Converter Online - Best Quality JPEG",
      description:
        "Free PDF to JPG image converter online. Bulk convert PDF pages to best quality JPEG or PNG in your browser — no upload, no app, no Adobe needed.",
      keywords: [
        "pdf to jpg",
        "pdf to jpg jpeg",
        "pdf to png",
        "pdf to jpg editor",
        "pdf to jpg image converter",
        "pdf to jpg apps",
        "pdf to jpg adobe",
        "pdf to jpg best quality",
        "pdf to jpg bulk converter",
        "pdf to jpg converter online",
        "pdf to image",
        "pdf to jpg converter free",
        "pdf to jpg converter",
        "pdf to jpg no upload",
        "pdf page to image",
        "convert pdf to jpg",
        "pdf to jpg free",
        "client-side pdf to jpg",
        "private pdf to image converter",
        "snapbittools pdf to jpg",
      ],
      url: "/pdf-to-jpg",
      type: "software",
      faqs,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "PDF to JPG Converter", path: "/pdf-to-jpg" },
      ],
      schema: {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to convert PDF to JPG online for free",
        description:
          "Convert every page of a PDF to best quality JPG (JPEG) or PNG images in your browser, without uploading the file or installing an app.",
        totalTime: "PT1M",
        tool: [{ "@type": "HowToTool", name: "SnapBit PDF to JPG Converter" }],
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Upload a PDF",
            text: "Drop a PDF onto the converter or pick a file from your device. It stays in your browser.",
            url: "https://snapbittools.com/pdf-to-jpg",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Choose JPG or PNG and DPI",
            text: "Select JPG (JPEG) or PNG, then Web (72), Screen (150), or Print (300) DPI. Use 300 DPI and high JPEG quality for the best quality output.",
            url: "https://snapbittools.com/pdf-to-jpg",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Convert all pages",
            text: "Click Convert. Every page is converted to an image in bulk, with page-by-page progress.",
            url: "https://snapbittools.com/pdf-to-jpg",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Download JPG images",
            text: "Download a single page or save every JPG image as a ZIP.",
            url: "https://snapbittools.com/pdf-to-jpg",
          },
        ],
      },
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-theme-page theme-page-gradient py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl mt-6 mb-12 text-center mx-auto">
            <div className="text-center">
              <h1 className="text-2xl sm:text-5xl font-bold text-theme-heading mb-2 tracking-tight text-shadow-sm">
                PDF to JPG Converter
              </h1>
              <p className="text-md text-theme-body">
                Free online PDF to JPG image converter. Bulk convert pages to best quality JPEG or
                PNG — no upload, no app.
              </p>
            </div>
          </div>

          <PdfToJpgTool />
        </div>
        <ToolContentDisplay
          title={toolContent["pdf-to-jpg"].title}
          intro={toolContent["pdf-to-jpg"].intro}
          benefits={toolContent["pdf-to-jpg"].benefits}
          useCases={toolContent["pdf-to-jpg"].useCases}
        />

        <ToolInfo
          title="PDF to JPG Converter"
          description="SnapBit’s free PDF to JPG image converter renders each page locally with PDF.js and saves high-quality JPEG or PNG images. A lightweight alternative to Adobe Acrobat or desktop apps for sharing scans, posting a single page, or bulk-exporting slides — without uploading the file."
          features={[
            {
              title: "Private by Default",
              description: "Pages are rendered in your browser. No account and no upload.",
              icon: IconLock,
            },
            {
              title: "Best Quality, Your Choice",
              description:
                "Up to 300 DPI with adjustable JPEG quality, or lossless PNG for sharp text and diagrams.",
              icon: IconFileTypeJpg,
            },
            {
              title: "Bulk Convert to ZIP",
              description:
                "Convert every page at once. Preview thumbnails, download one page, or save all images as a ZIP.",
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
              description:
                "JPG (JPEG) or PNG, then Web (72), Screen (150), or Print (300) DPI for best quality.",
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

      <RelatedTools
        currentToolSlug="pdf-to-jpg"
        category="PDF"
      />
    </div>
  );
}
