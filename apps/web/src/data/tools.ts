import {
  type IconProps,
  IconBolt,
  IconBraces,
  IconCrop,
  IconArrowsMaximize,
  IconDownload,
  IconEraser,
  IconFileSpreadsheet,
  IconFileTypeJpg,
  IconFileTypePdf,
  IconNumber64Small,
  IconPhoto,
  IconSearch,
  IconTypography,
  IconFiles,
  IconCode,
  IconPalette,
} from "@tabler/icons-react";
import type React from "react";

export type ToolCategory = "Images" | "PDF" | "Data" | "Utility";

export type ToolDefinition = {
  slug: string;
  name: string;
  href: string;
  description: string;
  icon: (props: IconProps) => React.ReactNode;
  category: ToolCategory;
  keywords: string[];
  isNew?: boolean;
};

export type ToolCategoryMeta = {
  id: string;
  href: "/image-tools" | "/pdf-tools" | "/data-tools" | "/utility-tools";
  navLabel: string;
  heading: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
};

export const TOOL_CATEGORY_ORDER: ToolCategory[] = ["Images", "PDF", "Data", "Utility"];

export const toolCategories: Record<ToolCategory, ToolCategoryMeta> = {
  Images: {
    id: "images",
    href: "/image-tools",
    navLabel: "Images",
    heading: "Image tools",
    description: "Convert, compress, crop, resize, and edit images entirely in your browser.",
    seoTitle: "Image Tools | Convert, Compress, Crop Online | SnapBit Tools",
    seoDescription: "Free browser-based image tools. Convert formats, compress photos, crop, resize, and remove backgrounds — no uploads.",
    keywords: ["image tools", "image converter", "image compressor", "crop image", "resize image", "remove background"],
  },
  PDF: {
    id: "pdf",
    href: "/pdf-tools",
    navLabel: "PDF",
    heading: "PDF tools",
    description: "Create, convert, and compress PDFs on your device. Nothing is uploaded.",
    seoTitle: "PDF Tools | Convert, Compress, Image to PDF | SnapBit Tools",
    seoDescription: "Free private PDF tools in your browser. Convert PDF to JPG, compress PDFs, and merge images into PDF — no uploads.",
    keywords: ["pdf tools", "pdf to jpg", "compress pdf", "image to pdf", "pdf converter"],
  },
  Data: {
    id: "data",
    href: "/data-tools",
    navLabel: "Data",
    heading: "Data tools",
    description: "Format JSON, convert CSV and Excel, minify HTML, and decode Base64 locally.",
    seoTitle: "Data Tools | JSON, CSV, Excel, Base64 | SnapBit Tools",
    seoDescription:
      "Free data tools in your browser. Format JSON, convert CSV to Excel or JSON, minify HTML, and decode Base64 — no uploads.",
    keywords: ["json formatter", "csv to excel", "csv to json", "html minifier", "base64 decoder", "data tools"],
  },
  Utility: {
    id: "utility",
    href: "/utility-tools",
    navLabel: "Utility",
    heading: "Utility tools",
    description: "Word count, diffs, lorem ipsum, bulk rename, and color palettes — all client-side.",
    seoTitle: "Utility Tools | Word Counter, Diff, Rename | SnapBit Tools",
    seoDescription:
      "Free utility tools in your browser. Count words, compare text, generate lorem ipsum, rename files, and build color palettes.",
    keywords: ["word counter", "diff checker", "lorem ipsum", "bulk rename", "color palette", "online utilities"],
  },
};

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}

export const tools: ToolDefinition[] = [
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    href: "/image-to-base64",
    description: "Convert images to Base64 instantly with full client-side privacy.",
    icon: IconNumber64Small,
    category: "Images",
    keywords: [
      "base64",
      "encode",
      "image converter",
      "privacy",
      "data uri encode",
      "jpg to base64",
      "png to base64",
      "webp to base64",
      "avif to base64",
      "image to base64 converter",
      "photo to base64",
      "picture to base64",
      "convert image to base64",
      "base64 encoding for images",
      "image data uri encoder",
      "image url to base64",
      "base64 image generator",
      "image to base64 online",
      "offline image to base64 converter",
      "compress image to base64",
      "optimize image to base64",
      "fast image to base64 converter",
      "secure image to base64 converter",
    ],
  },
  {
    slug: "base64-to-file",
    name: "Base64 to File",
    href: "/base64-to-file",
    description: "Decode Base64 back to original files like TXT, images, PDF, Excel, and more.",
    icon: IconDownload,
    category: "Data",
    keywords: [
      "base64 decode",
      "base64 to file",
      "data uri decode",
      "decode base64",
      "base64 to txt",
      "base64 to image",
      "base64 to pdf",
      "base64 to excel",
      "base64 to file converter",
      "base64 decoder online",
      "offline base64 to file converter",
      "secure base64 to file converter",
      "fast base64 to file converter",
      "base64 decoding tool",
      "base64 to file converter online",
      "base64 to file converter offline",
      "base64 to file converter secure",
      "base64 to pdf converter",
      "base64 to excel converter",
      "base64 to image converter",
      "base64 to zip converter",
      "base64 to docx converter",
      "base64 to pptx converter",
      "base64 to csv converter",
    ],
    isNew: true,
  },
  {
    slug: "image-format-converter",
    name: "Format Converter",
    href: "/image-format-converter",
    description: "Convert PNG, JPEG, WebP, and AVIF in seconds. No uploads needed.",
    icon: IconPhoto,
    category: "Images",
    keywords: ["png", "jpeg", "webp", "avif", "convert"],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    href: "/image-compressor",
    description: "Shrink file size without losing quality. Fast, offline-friendly.",
    icon: IconBolt,
    category: "Images",
    keywords: ["compress", "optimize", "reduce size", "image"],
  },
  {
    slug: "image-background-remover",
    name: "Background Remover",
    href: "/image-background-remover",
    description: "Remove image backgrounds with AI. Private, browser-only cutouts.",
    icon: IconEraser,
    category: "Images",
    keywords: ["remove background", "background remover", "transparent png", "ai cutout", "remove bg"],
    isNew: true,
  },
  {
    slug: "image-cropper",
    name: "Image Cropper",
    href: "/image-cropper",
    description: "Crop, rotate, and resize images with pixel-perfect previews.",
    icon: IconCrop,
    category: "Images",
    keywords: ["crop", "resize", "rotate", "edit"],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    href: "/image-resizer",
    description: "Resize images instantly while keeping the original aspect ratio.",
    icon: IconArrowsMaximize,
    category: "Images",
    keywords: ["resize image", "aspect ratio", "dimensions", "photo resizer"],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    href: "/image-to-pdf",
    description: "Combine multiple images into a single PDF instantly, all offline.",
    icon: IconFileTypePdf,
    category: "PDF",
    keywords: ["pdf", "merge", "images to pdf", "offline"],
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    href: "/pdf-to-jpg",
    description: "Convert PDF pages to JPG or PNG in your browser. Private, no upload.",
    icon: IconFileTypeJpg,
    category: "PDF",
    keywords: ["pdf to jpg", "pdf to jpeg", "pdf to png", "pdf to image", "convert pdf to jpg", "pdf page to image"],
    isNew: true,
  },
  {
    slug: "pdf-compressor",
    name: "PDF Compressor",
    href: "/pdf-compressor",
    description: "Shrink PDF size in your browser. Private, no upload required.",
    icon: IconFileTypePdf,
    category: "PDF",
    keywords: ["compress pdf", "pdf compressor", "reduce pdf size", "shrink pdf", "pdf optimizer"],
    isNew: true,
  },
  {
    slug: "bulk-file-renamer",
    name: "Bulk File Renamer",
    href: "/bulk-file-renamer",
    description: "Rename multiple files at once with pattern matching like file-[1,2,3...]. Works offline with zero uploads.",
    icon: IconFiles,
    category: "Utility",
    keywords: ["bulk rename", "file renamer", "batch rename", "file management"],
    isNew: true,
  },
  {
    slug: "color-palette-generator",
    name: "Color Palette",
    href: "/color-palette-generator",
    description:
      "Generate color palettes using color theory. Complementary, triadic, shades, brand & more. Export as CSS, JSON, or Tailwind.",
    icon: IconPalette,
    category: "Utility",
    keywords: [
      "color palette generator",
      "color scheme",
      "complementary colors",
      "triadic palette",
      "color theory",
      "hex rgb hsl",
      "brand colors",
      "color shades",
      "tailwind palette",
      "css variables",
      "wcag contrast",
      "accessible colors",
    ],
    isNew: true,
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    href: "/json-formatter",
    description: "Format, validate, and minify JSON securely in your browser.",
    icon: IconBraces,
    category: "Data",
    keywords: ["json", "format", "minify", "validate"],
  },
  {
    slug: "csv-xlsx-converter",
    name: "CSV ↔ XLSX",
    href: "/csv-xlsx-converter",
    description: "Convert CSV to Excel and back with batch support and zero uploads.",
    icon: IconFileSpreadsheet,
    category: "Data",
    keywords: ["csv", "xlsx", "excel", "convert"],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    href: "/word-counter",
    description: "Count words, characters, and sentences in real-time with reading time estimation.",
    icon: IconTypography,
    category: "Utility",
    keywords: ["word count", "character count", "letters", "reading time"],
  },
  {
    slug: "html-minifier",
    name: "HTML Minifier",
    href: "/html-minifier",
    description: "Minify HTML by removing comments and extra whitespace. Fast, private, browser-based.",
    icon: IconCode,
    category: "Data",
    keywords: ["html minifier", "minify html", "html optimizer", "compress html"],
    isNew: true,
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    href: "/diff-checker",
    description:
      "Compare two text files or code snippets side-by-side. 100% private, browser-based diff tool with support for additions and deletions.",
    icon: IconSearch,
    category: "Utility",
    keywords: ["diff checker", "text comparison", "compare code online", "online diff tool", "file comparison"],
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum",
    href: "/lorem-ipsum-generator",
    description: "Generate placeholder text with custom paragraphs, words, and sentences.",
    icon: IconTypography,
    category: "Utility",
    keywords: ["lorem ipsum", "placeholder text", "dummy text", "text generator"],
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    href: "/json-to-csv",
    description: "Convert nested JSON arrays to CSV instantly. Flatten objects and handle large files.",
    icon: IconFileSpreadsheet,
    category: "Data",
    keywords: ["json to csv", "convert json", "csv generator", "data tables"],
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    href: "/csv-to-json",
    description: "Convert CSV data to structured JSON objects instantly. Handle headers and quoted fields.",
    icon: IconBraces,
    category: "Data",
    keywords: ["csv to json", "convert csv", "json generator", "data extraction"],
  },
];
