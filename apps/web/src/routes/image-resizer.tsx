import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedTools from "@/components/RelatedTools";
import { ImageResizerTool } from "@/components/ImageResizerTool";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";
import { IconAspectRatio, IconArrowsMaximize, IconLock } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

const faqs = [
  {
    question: "Does the tool keep the original aspect ratio while resizing?",
    answer:
      "Yes. The tool automatically locks the aspect ratio, so when you change width, height is calculated for you to prevent stretching.",
  },
  {
    question: "Are my uploaded images stored anywhere?",
    answer:
      "No. Resizing happens entirely in your browser on your own device. No uploads, no server storage, and no tracking of your files.",
  },
  {
    question: "Can I resize images for social media or website use?",
    answer:
      "Absolutely. You can quickly resize images to exact dimensions while preserving proportions, which is perfect for social posts, blog headers, and web assets.",
  },
  {
    question: "Will resizing affect image quality?",
    answer:
      "Downscaling generally preserves strong visual quality and often reduces file size. Upscaling can increase dimensions but cannot add missing detail from the original image.",
  },
];

export const Route = createFileRoute("/image-resizer")({
  head: () =>
    getSeoMetadata({
      title: "Image Resizer - Resize Images Online with Aspect Ratio Lock",
      description:
        "Resize images online while maintaining aspect ratio. Upload, set width, and download resized images instantly. 100% private and browser-based.",
      keywords: [
        "image resizer",
        "resize image online",
        "maintain aspect ratio",
        "photo resizer",
        "resize image without distortion",
      ],
      url: "/image-resizer",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black pt-24 pb-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <Breadcrumbs />
        <div className="text-center mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-100 mb-2">
            Image <span className="text-brand-primary">Resizer</span>
          </h1>
          <p className="text-md text-gray-300">
            Upload an image, choose width, and resize instantly with automatic aspect ratio lock. Private, fast, and fully browser-based.
          </p>
        </div>

        <ImageResizerTool />

        <ToolContentDisplay
          title={toolContent["image-resizer"].title}
          intro={toolContent["image-resizer"].intro}
          benefits={toolContent["image-resizer"].benefits}
          useCases={toolContent["image-resizer"].useCases}
        />

        <ToolInfo
          title="Image Resizer"
          description="Our Image Resizer helps you scale images to precise dimensions without stretching or distortion. It keeps the original aspect ratio automatically and processes everything locally in your browser for complete privacy and speed."
          features={[
            {
              title: "Aspect Ratio Lock",
              description: "Resize by width and let height update automatically so your image keeps perfect proportions.",
              icon: IconAspectRatio,
            },
            {
              title: "Pixel-Level Control",
              description: "Set exact output dimensions for web banners, social posts, thumbnails, and app assets.",
              icon: IconArrowsMaximize,
            },
            {
              title: "Privacy First",
              description: "Your images never leave your device. Everything runs client-side in your browser.",
              icon: IconLock,
            },
          ]}
          steps={[
            {
              title: "Upload Image",
              description: "Drag and drop an image or choose it from your device.",
            },
            {
              title: "Set Width",
              description: "Enter a target width or use the scale slider to pick the desired size.",
            },
            {
              title: "Resize Instantly",
              description: "Click resize and the tool generates a new image with the same aspect ratio.",
            },
            {
              title: "Download",
              description: "Preview and download the resized image with one click.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="image-resizer" category="Images" />

      <div className="mt-8">
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
  );
}
