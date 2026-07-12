import {
  IconEraser,
  IconLock,
  IconSparkles,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { ImageBackgroundRemovalTool } from "@/components/ImageBackgroundRemovalTool";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How does the image background remover work?",
    answer:
      "It uses the open-source @imgly/background-removal library (ONNX Runtime) to run an AI segmentation model entirely in your browser via a Web Worker. Your image never leaves your device.",
  },
  {
    question: "Is my photo uploaded to a server?",
    answer:
      "No. Processing is 100% client-side. The only network request is downloading the AI model files (cached by your browser after the first run). Your image pixels stay on your device.",
  },
  {
    question: "Why is the first run slower?",
    answer:
      "The first removal prepares the on-device AI engine and stores it in your browser’s IndexedDB cache. Later runs reuse that cache and finish much faster.",
  },
  {
    question: "What output format do I get?",
    answer:
      "A transparent PNG with the subject in the foreground and the background removed. You can download it and use it in designs, product listings, or further edits.",
  },
  {
    question: "Which images work best?",
    answer:
      "Photos with a clear subject (people, products, pets) against a distinct background work best. Very busy scenes or fine hair details may need a touch-up in an editor afterward.",
  },
];

export const Route = createFileRoute("/_wrap/image-background-remover")({
  head: () =>
    getSeoMetadata({
      title: "Remove Image Background Online Free - AI Background Remover",
      description:
        "Remove image backgrounds free in your browser with AI. No uploads, no signup. Transparent PNG download powered by @imgly/background-removal. Private and client-side.",
      keywords: [
        "remove background from image",
        "image background remover",
        "ai background remover free",
        "remove bg online",
        "transparent png maker",
        "background removal tool",
        "client-side background remover",
        "privacy background remover",
        "remove photo background free",
        "imgly background removal",
        "online bg remover no upload",
        "cut out image background",
        "product photo background remover",
        "free ai remove background",
        "snapbittools background remover",
      ],
      url: "/image-background-remover",
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
            Remove <span className="text-brand-primary">Background</span>
          </h1>
          <p className="text-md text-theme-body">
            AI-powered background removal that runs entirely in your browser. Upload a photo, get a
            transparent PNG — no uploads, no account, free forever.
          </p>
        </div>

        <ImageBackgroundRemovalTool />

        <ToolContentDisplay
          title={toolContent["image-background-remover"].title}
          intro={toolContent["image-background-remover"].intro}
          benefits={toolContent["image-background-remover"].benefits}
          useCases={toolContent["image-background-remover"].useCases}
        />

        <ToolInfo
          title="Image Background Remover"
          description="SnapBit's Image Background Remover uses on-device AI to cut subjects out of photos and produce transparent PNGs. Built on @imgly/background-removal and processed in a Web Worker so your UI stays responsive."
          features={[
            {
              title: "AI Cutout",
              description:
                "Neural network segmentation isolates the subject and removes the background automatically.",
              icon: IconSparkles,
            },
            {
              title: "Private by Design",
              description:
                "Images are processed in a Web Worker on your device. Nothing is uploaded to SnapBit servers.",
              icon: IconLock,
            },
            {
              title: "Transparent PNG",
              description:
                "Download a ready-to-use PNG with alpha channel for product shots, avatars, and design work.",
              icon: IconEraser,
            },
          ]}
          steps={[
            {
              title: "Upload an image",
              description: "Drop a JPG, PNG, or WebP photo into the tool — or pick a file.",
            },
            {
              title: "Remove the background",
              description:
                "Click Remove Background. Watch progress while the model loads and processes in a worker.",
            },
            {
              title: "Preview the cutout",
              description: "Review the transparent result on a checkerboard preview.",
            },
            {
              title: "Download PNG",
              description: "Save the background-free image as a PNG for use anywhere.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="image-background-remover" category="Images" />

      <div className="mt-8">
        <p className="text-theme-muted text-xs text-center">
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
  );
}
