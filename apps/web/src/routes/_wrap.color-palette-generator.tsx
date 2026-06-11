import { createFileRoute } from "@tanstack/react-router";
import { IconLock, IconWand, IconPalette, IconDownload } from "@tabler/icons-react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";
import { ColorPaletteTool } from "@/components/ColorPaletteTool";

const faqs = [
  {
    question: "What color theory modes are available?",
    answer:
      "The tool offers Complementary, Triadic, Analogous, Split-Complementary, and Tetradic (Square) modes — each based on standard color wheel relationships used by professional designers.",
  },
  {
    question: "What is a brand palette?",
    answer:
      "The Brand mode generates a complete design-system-ready palette from your base color: a primary, light primary, dark primary, neutral text, neutral background, and an accent — ideal for building UI color tokens.",
  },
  {
    question: "Can I lock individual colors when regenerating?",
    answer:
      "Yes. Hover over any color swatch and click the lock icon to pin that color. Subsequent generations will keep locked colors unchanged while refreshing the rest.",
  },
  {
    question: "What WCAG contrast information is shown?",
    answer:
      "The color detail table shows each color's contrast ratio against both white (#FFFFFF) and black (#000000), along with its WCAG 2.1 AA compliance level for normal and large text.",
  },
  {
    question: "How do I export the palette?",
    answer:
      "Click the Export button and choose CSS Variables (.css), JSON (.json), or Tailwind Config (.js). Each format is ready to paste directly into your project.",
  },
  {
    question: "Are my saved palettes stored on a server?",
    answer:
      "No. Saved palettes are stored entirely in your browser's localStorage. Nothing is uploaded or sent to any server.",
  },
];

export const Route = createFileRoute("/_wrap/color-palette-generator")({
  head: () =>
    getSeoMetadata({
      title: "Color Palette Generator | HEX, RGB, HSL | SnapBit Tools",
      description:
        "Generate beautiful color palettes instantly. Random, shades, contrast, brand, and color theory modes (complementary, triadic, analogous). Export as CSS, JSON, or Tailwind. 100% free and private.",
      keywords: [
        "color palette generator",
        "color scheme generator",
        "random color palette",
        "complementary colors",
        "triadic color scheme",
        "analogous colors",
        "brand color palette",
        "color shades generator",
        "hex color palette",
        "rgb color palette",
        "hsl color palette",
        "color theory tool",
        "tailwind color palette",
        "css variables color palette",
        "WCAG color contrast",
        "accessible color palette",
        "color wheel generator",
        "tetradic color scheme",
        "split complementary colors",
        "color palette from image",
      ],
      url: "/color-palette-generator",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="min-h-screen py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <div className="text-center my-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-theme-heading mb-2">
            Color <span className="text-brand-primary">Palette</span> Generator
          </h1>
          <p className="text-md text-theme-body">
            Generate harmonious color palettes using color theory. Random, shades, brand & more. Export as CSS, JSON, or Tailwind.
          </p>
        </div>

        <ColorPaletteTool />

        <ToolContentDisplay
          title={toolContent["color-palette-generator"].title}
          intro={toolContent["color-palette-generator"].intro}
          benefits={toolContent["color-palette-generator"].benefits}
          useCases={toolContent["color-palette-generator"].useCases}
        />

        <ToolInfo
          title="Color Palette Generator"
          description="A comprehensive color palette tool for designers and developers. Generate harmonious palettes using color theory, export in multiple formats, and check WCAG accessibility contrast ratios."
          features={[
            {
              title: "Color Theory Modes",
              description:
                "Nine generation modes including complementary, triadic, analogous, split-complementary, tetradic, shades, contrast, brand, and random.",
              icon: IconPalette,
            },
            {
              title: "Privacy First",
              description:
                "Everything runs in your browser. Saved palettes are stored in localStorage — no data is ever uploaded.",
              icon: IconLock,
            },
            {
              title: "Smart Generation",
              description:
                "Lock individual colors before regenerating to keep favorites while refreshing the rest of the palette.",
              icon: IconWand,
            },
            {
              title: "Export Ready",
              description:
                "Download palettes as CSS custom properties, JSON with all formats, or a Tailwind config snippet.",
              icon: IconDownload,
            },
          ]}
          steps={[
            {
              title: "Choose a Mode",
              description:
                "Pick a generation mode: Random for exploration, or select a color theory mode like Triadic or Analogous for structured harmony.",
            },
            {
              title: "Set a Base Color",
              description:
                "For non-random modes, pick or enter your base color using the color picker or hex input field.",
            },
            {
              title: "Generate & Refine",
              description:
                "Click Generate to build the palette. Lock colors you want to keep, then generate again to refine.",
            },
            {
              title: "Copy or Export",
              description:
                "Click any swatch to copy its value in your chosen format, or use Export to download the full palette.",
            },
          ]}
          faqs={faqs}
        />

        <RelatedTools currentToolSlug="color-palette-generator" category="Images" />

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
    </div>
  );
}
