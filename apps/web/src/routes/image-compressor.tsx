import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";
import { IconArrowsMinimize, IconBolt, IconLock } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { getSeoMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ImageCompressorTool } from "@/components/ImageCompressorTool";

const faqs = [
  {
    question: "How does the image compressor work?",
    answer:
      "The compressor uses advanced browser-based algorithms to optimize your images. It reduces the file size by adjusting the quality level and dimensions while maintaining visual clarity, all right in your browser.",
  },
  {
    question: "Is my privacy protected when compressing images?",
    answer:
      "Yes! Unlike other online tools, our compressor is 100% client-side. Your images are never uploaded to a server—they remain on your device throughout the entire process.",
  },
  {
    question: "Can I compress multiple images at once?",
    answer:
      "Absolutely. You can drop multiple images into the tool, adjust the settings globally, and download the entire batch as a ZIP file.",
  },
  {
    question: "What is the best format for compression?",
    answer:
      "JPEG typically offers the best compression for photographs, while PNG is better for images with text or transparency. Our tool can also convert images to JPEG to maximize space savings.",
  },
];

export const Route = createFileRoute("/image-compressor")({
  head: () =>
    getSeoMetadata({
      title: "Compress Images Online - Free Online Tool",
      description:
        "Compress JPG, PNG, WebP and AVIF images for free. Shrink image file sizes by up to 80% without losing quality. 100% private, client-side, and free.",
      keywords: [
        "compress png",
        "compress jpeg",
        "compress webp",
        "compress avif",
        "image compressor",
        "reduce image size",
        "online image optimizer",
      ],
      url: "/image-compressor",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <Breadcrumbs />
        <div className="text-center mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-100 mb-2">
            Compress <span className="text-brand-primary">Images</span>
          </h1>
          <p className="text-md text-gray-300">
            Compress JPG, PNG, WebP and AVIF images for free. Reduce file size up to 80% while preserving quality. 100% client-side—your
            files never leave.
          </p>
        </div>

        <ImageCompressorTool />

        <ToolContentDisplay
          title={toolContent["image-compressor"].title}
          intro={toolContent["image-compressor"].intro}
          benefits={toolContent["image-compressor"].benefits}
          useCases={toolContent["image-compressor"].useCases}
        />

        <ToolInfo
          title="Image Compressor"
          description="Our Image Compressor helps you significantly reduce the file size of your images without sacrificing visible quality. By utilizing advanced browser-based compression algorithms, you can optimize your PNG, JPEG, and WebP files for faster web loading and reduced storage usage."
          features={[
            {
              title: "Quality Control",
              description: "Fine-tune the compression level to find the perfect balance between file size and image clarity.",
              icon: IconBolt,
            },
            {
              title: "Privacy Guaranteed",
              description: "Processing happens entirely in your browser. No images are ever uploaded to a server.",
              icon: IconLock,
            },
            {
              title: "Bulk Compression",
              description: "Compress dozens of images simultaneously and download them all at once in a ZIP file.",
              icon: IconArrowsMinimize,
            },
          ]}
          steps={[
            {
              title: "Add Images",
              description: "Drop your images into the compression zone or use the file picker to select them.",
            },
            {
              title: "Adjust Settings",
              description: "Set your desired quality and maximum dimensions to optimize your images further.",
            },
            {
              title: "Review Savings",
              description: "Instantly see how much space you have saved for each image after compression.",
            },
            {
              title: "Download All",
              description: "Download individual optimized images or grab the entire batch as a ZIP archive.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools currentToolSlug="image-compressor" category="Images" />

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

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
