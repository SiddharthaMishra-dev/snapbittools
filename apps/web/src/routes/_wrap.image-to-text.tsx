import { IconEye, IconLock, IconScan } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { MirageVisionTool } from "@/components/MirageVisionTool";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How does this image to text tool work?",
    answer:
      "It runs Mirage, an open-source vision model from Cactus Compute, on the Cactus WebAssembly engine in a Web Worker in your browser. Mirage finds text regions, reads each line, and returns it with a bounding box and a confidence score.",
  },
  {
    question: "Is my image uploaded to a server?",
    answer:
      "No. Your image is decoded and analyzed on your device. The only network request is the one-time download of the Mirage model (about 21 MB) from Hugging Face, which your browser then caches.",
  },
  {
    question: "Which languages can it read?",
    answer:
      "Mirage reads Latin-script text: 306 characters covering English, German, French, Spanish, Italian, Dutch, Polish, and many other languages that use the Latin alphabet. It does not read Chinese, Japanese, Arabic, Cyrillic, or other scripts.",
  },
  {
    question: "How accurate is the OCR?",
    answer:
      "Clear printed text, such as documents, receipts, and screenshots, reads well. Small, blurry, curved, or handwritten text can be misread. Each line shows a confidence score, and you can edit the text before copying it.",
  },
  {
    question: "What else can Mirage do?",
    answer:
      "Describe & detect returns a scene summary, objects with boxes, segmentation masks and attributes, and relations between them, in seven languages. Ask questions fills a small form: it picks from labels you give it, counts within a range, or reads a short text field, with probabilities for each answer.",
  },
  {
    question: "Why is the first run slower?",
    answer:
      "The first run downloads the Mirage model and starts the WebAssembly engine. Later runs use the cached model and usually take a few seconds per image, depending on your device.",
  },
];

export const Route = createFileRoute("/_wrap/image-to-text")({
  head: () =>
    getSeoMetadata({
      title: "Image to Text (OCR) – Free, Private, No Upload",
      description:
        "Extract text from images, scans, and screenshots with on-device AI. No uploads, no account. Also describes scenes and detects objects.",
      keywords: [
        "image to text",
        "ocr online free",
        "extract text from image",
        "screenshot to text",
        "photo to text",
        "picture to text converter",
        "ocr no upload",
        "private ocr",
        "offline ocr browser",
        "copy text from image",
        "describe image ai",
        "object detection online",
        "mirage vision model",
        "cactus compute mirage",
        "snapbittools image to text",
      ],
      url: "/image-to-text",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const content = toolContent["image-to-text"];
  return (
    <div className="bg-theme-page theme-page-gradient py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl mt-6 mb-12 text-center mx-auto">
            <h1 className="text-2xl sm:text-5xl font-bold text-theme-heading mb-2 tracking-tight text-shadow-sm">Image to Text</h1>
          </div>

          <MirageVisionTool />
        </div>
        <ToolContentDisplay title={content.title} intro={content.intro} benefits={content.benefits} useCases={content.useCases} />

        <ToolInfo
          title="Image to Text (OCR)"
          description="SnapBit's Image to Text tool runs the Mirage vision model from Cactus Compute in your browser. It reads text, describes scenes, detects objects, and answers simple questions about an image, without sending the image anywhere."
          features={[
            {
              title: "On-device OCR",
              description: "Reads each line of text with a box and confidence score, then puts the lines in reading order.",
              icon: IconScan,
            },
            {
              title: "Scene understanding",
              description: "Describes the scene and finds objects with boxes, masks, attributes, and relations.",
              icon: IconEye,
            },
            {
              title: "Private by design",
              description: "Runs in a Web Worker on WebAssembly. Your image never leaves your device.",
              icon: IconLock,
            },
          ]}
          steps={[
            { title: "Add an image", description: "Drop a photo, scan, or screenshot, choose a file, or paste with Ctrl+V." },
            { title: "Let Mirage read it", description: "Text extraction starts right away. The model downloads once on first use." },
            { title: "Review the result", description: "Hover a line to see where it is on the image. Fix any mistakes in the text box." },
            { title: "Copy or download", description: "Copy the text, or save it as TXT. Download the full Mirage output as JSON." },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="image-to-text" category="Images" />
    </div>
  );
}
