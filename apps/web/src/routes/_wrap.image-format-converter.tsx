import { createFileRoute } from "@tanstack/react-router";

import { IconBox, IconLock, IconArrowsExchange } from "@tabler/icons-react";
import ToolInfo from "../components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ClusterLinks from "@/components/ClusterLinks";
import { getPillarSpokes } from "@/lib/internal-linking";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";

import { getSeoMetadata } from "@/lib/seo";
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
    answer:
      "No, you can convert as many images as you want. There are no daily limits, and you don't even need to create an account.",
  },
  {
    question: "Is this image format converter free to use?",
    answer:
      "Yes. SnapBit’s Image Format Converter is 100% free with no signup, no watermarks, and no daily conversion limits. You can convert as many images as you need, anytime.",
  },
  {
    question: "Do I need to upload my images to convert them?",
    answer:
      "No. All conversions happen locally in your browser. Your files never leave your device, so nothing is uploaded to a server and your images stay private.",
  },
  {
    question: "Does converting an image reduce quality?",
    answer:
      "It depends on the format. PNG and lossless WebP/AVIF keep original quality. Converting to JPEG, or using lossy WebP/AVIF, can slightly reduce quality while making files much smaller. You can choose the output format based on whether you need quality or smaller file size.",
  },
  {
    question: "Can I convert multiple images at once?",
    answer:
      "Yes. The tool supports batch conversion. Drag and drop several images, convert them together, and download files individually or as a ZIP archive.",
  },
  {
    question: "Will transparency be preserved when I convert images?",
    answer:
      "Transparency is preserved when converting between formats that support it, such as PNG, WebP, AVIF, and ICO. If you convert a transparent image to JPEG or BMP, the transparent areas are filled because those formats do not support transparency.",
  },
  {
    question: "What is the best image format for websites in 2026?",
    answer:
      "WebP is the best all-around choice for most websites because it offers strong compression, wide browser support, and optional transparency. AVIF usually creates even smaller files but has slightly less support. Use JPEG for maximum compatibility and PNG for logos, screenshots, or graphics that need sharp edges.",
  },
  {
    question: "Can I convert HEIC photos from iPhone?",
    answer:
      "Yes. You can convert iPhone HEIC images to JPG, PNG, WebP, or other supported formats. This is useful when a website, Windows app, or form only accepts standard image types.",
  },
  {
    question: "Is this image converter safe to use?",
    answer:
      "Yes. Because processing happens entirely in your browser, your images are never sent to our servers. There is no tracking of file contents, no account required, and no data stored after you close the page.",
  },
  {
    question: "What’s the difference between JPG, PNG, WebP, and AVIF?",
    answer:
      "JPG is best for photos and has universal support but no transparency. PNG is lossless and supports transparency, so it works well for logos and screenshots. WebP offers smaller files than JPG/PNG with good quality and transparency. AVIF usually compresses even more than WebP and is ideal for modern websites.",
  },
  {
    question: "Can I convert WebP or AVIF back to JPG or PNG?",
    answer:
      "Yes. If an app or website does not open WebP or AVIF files, convert them back to JPG or PNG for wider compatibility. This is one of the most common uses of the tool.",
  },
];

export const Route = createFileRoute("/_wrap/image-format-converter")({
  head: () =>
    getSeoMetadata({
      title: "Image Format Converter | PNG, JPG, WebP, AVIF | SnapBit Tools",
      description:
        "Convert images between PNG, JPEG, WebP, and AVIF formats instantly. Supports batch processing and ZIP downloads. 100% private and client-side.",
      keywords: [
        "convert image format online",
        "image converter no upload / private image converter",
        "png to jpg / jpg to png / webp converter / avif converter",
        "batch image converter",
        "convert images to webp / convert images to avif",
        "free image format converter no upload",
        "convert png to webp online free",
        "best image format converter 2026",
        "browser based image converter",
        "image converter",
        "png to webp",
        "jpg to png",
        "avif converter",
        "batch image conversion",
        "image format converter",
        "webp to jpeg",
        "avif to png",
        "convert image formats online",
        "offline image format converter",
        "image converter size",
        "image converter to jpg",
        "image format converter online",
        "image format converter i love pdf",
        "image format converter to words",
        "secure image format converter",
        "fast image format converter",
        "image format conversion tool",
        "png to avif converter",
        "jpeg to webp converter",
        "webp to avif converter",
        "avif to jpeg converter",
      ],
      url: "/image-format-converter",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="min-h-screen py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        {/* <Breadcrumbs /> */}
        <div className="text-center  my-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-theme-heading mb-2">
            Image <span className="text-brand-primary">Format</span> Converter
          </h1>
          <p className="text-md text-theme-body">
            Convert images between formats instantly. Batch support. No uploads—100% private.
          </p>
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
              description:
                "Convert multiple images at once and download them all as a single ZIP file, saving you valuable time.",
              icon: IconBox,
            },
            {
              title: "Client-Side Only",
              description:
                "Conversions are performed entirely on your machine. Your private images never touch our servers.",
              icon: IconLock,
            },
            {
              title: "High Compatibility",
              description:
                "Convert between all modern web formats including PNG, JPG, WebP, and the next-gen AVIF format.",
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
              description:
                "Choose your desired output format (PNG, JPEG, WebP, or AVIF) from the dropdown.",
            },
            {
              title: "Automatic Conversion",
              description:
                "The tool will instantly begin converting each image to your chosen format.",
            },
            {
              title: "Download Results",
              description:
                "Download individual converted images or grab everything at once as a ZIP archive.",
            },
          ]}
          faqs={faqs}
        />

        <ClusterLinks
          heading="Also useful for"
          links={getPillarSpokes("image-format-converter")}
        />
        <RelatedTools
          currentToolSlug="image-format-converter"
          category="Images"
        />
      </div>
    </div>
  );
}
