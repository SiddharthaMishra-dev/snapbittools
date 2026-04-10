import { createFileRoute } from "@tanstack/react-router";

import { IconBox, IconLock, IconArrowsExchange } from "@tabler/icons-react";
import ToolInfo from "../components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";

import { getSeoMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ImageConverterTool } from "@/components/ImageConverterTool";

const faqs = [
  {
    question: "Which image formats are supported?",
    answer:
      "You can convert between all major web formats including PNG, JPEG, WebP, and AVIF. The tool also supports common image types like BMP and ICO.",
  },
  {
    question: "Does converting to WebP or AVIF save space?",
    answer:
      "Yes, significantly! WebP and AVIF are modern formats designed for the web. Converting standard JPEGs or PNGs to these formats can often reduce file size by 30% to 50% without quality loss.",
  },
  {
    question: "Can I convert images back to standard formats?",
    answer:
      "Absolutely. You can convert modern formats like WebP or AVIF back to widely compatible formats like JPEG or PNG for use in older applications.",
  },
  {
    question: "Is there a limit on the number of conversions?",
    answer: "No, you can convert as many images as you want. There are no daily limits, and you don't even need to create an account.",
  },
];

export const Route = createFileRoute("/_wrap/image-format-converter")({
  head: () =>
    getSeoMetadata({
      title: "Image Format Converter | PNG, JPG, WebP, AVIF | SnapBit Tools",
      description:
        "Convert images between PNG, JPEG, WebP, and AVIF formats instantly. Supports batch processing and ZIP downloads. 100% private and client-side.",
      keywords: ["image converter", "png to webp", "jpg to png", "avif converter", "batch image conversion"],
      url: "/image-format-converter",
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
        <div className="text-center  my-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-100 mb-2">
            Image <span className="text-brand-primary">Format</span> Converter
          </h1>
          <p className="text-md text-gray-300">Convert images between formats instantly. Batch support. No uploads—100% private.</p>
        </div>

        <ImageConverterTool />

        <ToolContentDisplay
          title={toolContent["image-format-converter"].title}
          intro={toolContent["image-format-converter"].intro}
          benefits={toolContent["image-format-converter"].benefits}
          useCases={toolContent["image-format-converter"].useCases}
        />

        <ToolInfo
          title="Image Format Converter"
          description="Our Image Format Converter allows you to seamlessly switch between popular image formats like JPEG, PNG, WebP, and AVIF. Whether you need to optimize for web performance with WebP/AVIF or maintain maximum compatibility with JPEG, this tool provides a fast and private solution directly in your browser."
          features={[
            {
              title: "Batch Processing",
              description: "Convert multiple images at once and download them all as a single ZIP file, saving you valuable time.",
              icon: IconBox,
            },
            {
              title: "Client-Side Only",
              description: "Conversions are performed entirely on your machine. Your private images never touch our servers.",
              icon: IconLock,
            },
            {
              title: "High Compatibility",
              description: "Convert between all modern web formats including PNG, JPG, WebP, and the next-gen AVIF format.",
              icon: IconArrowsExchange,
            },
          ]}
          steps={[
            {
              title: "Upload Images",
              description: "Drag and drop one or more images into the upload area or click select.",
            },
            {
              title: "Select Target Format",
              description: "Choose your desired output format (PNG, JPEG, WebP, or AVIF) from the dropdown.",
            },
            {
              title: "Automatic Conversion",
              description: "The tool will instantly begin converting each image to your chosen format.",
            },
            {
              title: "Download Results",
              description: "Download individual converted images or grab everything at once as a ZIP archive.",
            },
          ]}
          faqs={faqs}
        />

        <RelatedTools currentToolSlug="image-format-converter" category="Images" />

        {/* Footer */}
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
    </div>
  );
}
