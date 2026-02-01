import { type TablerIconsProps, IconBolt, IconBraces, IconCrop, IconFileSpreadsheet, IconFileTypePdf, IconNumber64Small, IconPhoto, IconSearch, IconTypography } from "@tabler/icons-react";

export type ToolDefinition = {
  slug: string;
  name: string;
  href: string;
  description: string;
  icon: (props: TablerIconsProps) => JSX.Element;
  category: "Images" | "Data";
  keywords: string[];
};

export const tools: ToolDefinition[] = [
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    href: "/image-to-base64",
    description: "Convert images to Base64 instantly with full client-side privacy.",
    icon: IconNumber64Small,
    category: "Images",
    keywords: ["base64", "encode", "image converter", "privacy"],
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
    slug: "image-cropper",
    name: "Image Cropper",
    href: "/image-cropper",
    description: "Crop, rotate, and resize images with pixel-perfect previews.",
    icon: IconCrop,
    category: "Images",
    keywords: ["crop", "resize", "rotate", "edit"],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    href: "/image-to-pdf",
    description: "Combine multiple images into a single PDF instantly, all offline.",
    icon: IconFileTypePdf,
    category: "Images",
    keywords: ["pdf", "merge", "images to pdf", "offline"],
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
    category: "Data",
    keywords: ["word count", "character count", "letters", "reading time"],
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    href: "/diff-checker",
    description: "Compare two text files or code snippets side-by-side. 100% private, browser-based diff tool with support for additions and deletions.",
    icon: IconSearch,
    category: "Data",
    keywords: ["diff checker", "text comparison", "compare code online", "online diff tool", "file comparison"],
  }
];
