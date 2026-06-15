import { createFileRoute, Link } from "@tanstack/react-router";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

import RelatedTools from "@/components/RelatedTools";
import { getSeoMetadata } from "@/lib/seo";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const PUBLISHED_DATE = "2026-05-07";
const MODIFIED_DATE = "2026-05-07";

const faqs = [
  {
    question: "Which image format is best for websites in 2026?",
    answer:
      "WebP is the safest all-around choice for web use in 2026. It offers 25–35% smaller file sizes than JPEG with comparable quality and enjoys near-universal browser support. For cutting-edge performance where browser support allows, AVIF delivers even better compression. JPEG remains reliable as a universal fallback.",
  },
  {
    question: "Is AVIF better than WebP?",
    answer:
      "In terms of raw compression efficiency, AVIF edges out WebP — often producing files 20–30% smaller at the same visual quality. However, WebP still holds a practical advantage due to broader browser support and faster encode times. AVIF is the long-term winner, but WebP is the safer choice today.",
  },
  {
    question: "Does converting JPEG to WebP reduce quality?",
    answer:
      "A well-tuned JPEG-to-WebP conversion at 80–90% quality produces output that is visually indistinguishable from the original in the vast majority of cases, while cutting file size by 25–40%. SnapBit Tools lets you set the quality level so you stay in full control.",
  },
  {
    question: "Can I convert images without uploading them to a server?",
    answer:
      "Yes. SnapBit Tools performs all conversions entirely in your browser. No files are sent to any server at any point — everything runs client-side using JavaScript and the Canvas API. Your images remain private on your device.",
  },
  {
    question: "What is the difference between PNG and WebP?",
    answer:
      "PNG uses lossless compression, meaning no quality is lost, but files are relatively large. WebP supports both lossless and lossy modes, and its lossless WebP files are typically 26% smaller than equivalent PNGs. For photos, lossy WebP is significantly smaller than PNG.",
  },
  {
    question: "Should I convert all my images to AVIF?",
    answer:
      "Not yet for all use cases. AVIF offers excellent compression but encoding can be slow and browser support, while improving, is not as universal as WebP. A practical strategy is to serve AVIF where supported, with WebP or JPEG as fallbacks. For quick one-off conversions, WebP is still the most practical choice.",
  },
  {
    question: "What happens to HEIC files from iPhone?",
    answer:
      "HEIC is Apple's default photo format and is not widely supported on the web or Windows. You should convert HEIC to JPG or WebP before sharing or publishing online. SnapBit Tools includes a free HEIC to JPG converter that runs entirely in your browser.",
  },
];

export const Route = createFileRoute("/_wrap/best-free-image-format-converter-2026")({
  head: () =>
    getSeoMetadata({
      title: "Best Free Image Format Converter 2026: WebP vs AVIF vs JPEG | SnapBit Tools",
      description:
        "Compare WebP, AVIF, JPEG, and PNG in 2026. Learn which image format is best for web performance and SEO, and convert any format for free using SnapBit Tools — no uploads, no sign-up.",
      keywords: [
        "best image format converter 2026",
        "webp vs avif vs jpeg",
        "webp vs jpeg 2026",
        "avif vs webp comparison",
        "best image format for web",
        "convert jpg to webp free",
        "convert png to webp online",
        "convert webp to jpg free",
        "convert jpeg to webp",
        "convert png to jpg online",
        "convert heic to jpg free",
        "free image format converter online",
        "image format comparison 2026",
        "best image format for seo",
        "avif browser support 2026",
        "webp image converter no upload",
        "convert images online free no signup",
        "jpg to webp converter",
        "png to webp converter",
        "webp vs png file size",
        "next gen image formats",
        "image format for website performance",
      ],
      url: "/best-free-image-format-converter-2026",
      type: "website",
      faqs,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blogs", path: "/blogs" },
        {
          name: "Best Free Image Format Converter 2026",
          path: "/best-free-image-format-converter-2026",
        },
      ],
      schema: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "Best Free Image Format Converter 2026: WebP vs AVIF vs JPEG",
        description:
          "A comprehensive comparison of modern image formats — WebP, AVIF, JPEG, and PNG — with a practical conversion guide using SnapBit Tools' free, private, browser-based image format converter.",
        url: "https://snapbittools.com/best-free-image-format-converter-2026",
        datePublished: PUBLISHED_DATE,
        dateModified: MODIFIED_DATE,
        author: {
          "@type": "Person",
          name: "Siddhartha Mishra",
          url: "https://sidme.dev/",
        },
        publisher: {
          "@type": "Organization",
          name: "SnapBit Tools",
          url: "https://snapbittools.com",
          logo: {
            "@type": "ImageObject",
            url: "https://snapbittools.com/logo.png",
          },
        },
        image: "https://snapbittools.com/screenshot.png",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": "https://snapbittools.com/best-free-image-format-converter-2026",
        },
        keywords:
          "webp vs avif vs jpeg, best image format 2026, image format converter, convert jpg to webp, convert png to webp, free image converter online, snapbittools",
        articleSection: "Image Optimization",
        inLanguage: "en-US",
        wordCount: 2200,
        about: [
          {
            "@type": "Thing",
            name: "WebP",
            description: "A modern image format developed by Google offering superior compression",
          },
          {
            "@type": "Thing",
            name: "AVIF",
            description:
              "Next-generation image format based on AV1 video codec with excellent compression",
          },
          {
            "@type": "Thing",
            name: "Image Format Conversion",
            description:
              "The process of converting images between formats like JPEG, PNG, WebP, and AVIF",
          },
        ],
      },
    }),
  component: BlogPage,
});

const tocItems: [string, string][] = [
  ["#format-overview", "The Four Major Formats at a Glance"],
  ["#webp-deep-dive", "WebP: The Practical Web Standard"],
  ["#avif-deep-dive", "AVIF: The Performance Leader"],
  ["#jpeg-png-still-relevant", "JPEG and PNG: Still Relevant?"],
  ["#head-to-head", "Head-to-Head Comparison Table"],
  ["#when-to-use", "Which Format Should You Use?"],
  ["#how-to-convert", "How to Convert Image Formats for Free"],
  ["#faqs", "Frequently Asked Questions"],
];

const formatOverview = [
  {
    name: "JPEG",
    year: "1992",
    type: "Lossy",
    transparency: "No",
    support: "Universal",
    idealFor: "Photographs, complex gradients",
    badgeClass: "bg-theme-surface-muted border-theme-border text-theme-body",
  },
  {
    name: "PNG",
    year: "1996",
    type: "Lossless",
    transparency: "Yes",
    support: "Universal",
    idealFor: "Logos, icons, UI graphics",
    badgeClass: "bg-theme-surface-muted border-theme-border text-theme-body",
  },
  {
    name: "WebP",
    year: "2010",
    type: "Lossy + Lossless",
    transparency: "Yes",
    support: "95%+ browsers",
    idealFor: "All web images",
    badgeClass: "bg-brand-primary/10 border-brand-primary/30 text-brand-primary",
  },
  {
    name: "AVIF",
    year: "2019",
    type: "Lossy + Lossless",
    transparency: "Yes",
    support: "~85% browsers",
    idealFor: "High-performance web images",
    badgeClass: "bg-theme-icon-bg border-brand-primary/20 text-brand-primary",
  },
];

const comparisonRows = [
  {
    criterion: "File Size (photo, same quality)",
    jpeg: "Baseline",
    png: "2–3x larger",
    webp: "25–35% smaller",
    avif: "40–55% smaller",
    winner: "AVIF",
  },
  {
    criterion: "Browser Support",
    jpeg: "100%",
    png: "100%",
    webp: "~96%",
    avif: "~85%",
    winner: "JPEG / PNG",
  },
  {
    criterion: "Transparency (alpha)",
    jpeg: "No",
    png: "Yes",
    webp: "Yes",
    avif: "Yes",
    winner: "WebP / AVIF / PNG",
  },
  {
    criterion: "Animation",
    jpeg: "No",
    png: "No (APNG yes)",
    webp: "Yes",
    avif: "Yes",
    winner: "WebP / AVIF",
  },
  {
    criterion: "Encoding Speed",
    jpeg: "Fast",
    png: "Fast",
    webp: "Fast",
    avif: "Slow",
    winner: "JPEG / WebP",
  },
  {
    criterion: "HDR / Wide Color",
    jpeg: "Limited",
    png: "Limited",
    webp: "No",
    avif: "Yes",
    winner: "AVIF",
  },
  {
    criterion: "Lossless Mode",
    jpeg: "No",
    png: "Yes",
    webp: "Yes",
    avif: "Yes",
    winner: "PNG / WebP / AVIF",
  },
  {
    criterion: "Overall Web Use Case",
    jpeg: "Good",
    png: "Good (graphics)",
    webp: "Excellent",
    avif: "Excellent (modern)",
    winner: "WebP / AVIF",
  },
];

const conversionTools = [
  {
    label: "JPG to WebP",
    href: "/jpg-to-webp",
    desc: "Convert JPEG photographs to WebP for significant file size reduction.",
  },
  {
    label: "PNG to WebP",
    href: "/png-to-webp",
    desc: "Convert PNG graphics and icons to WebP while preserving transparency.",
  },
  {
    label: "WebP to JPG",
    href: "/webp-to-jpg",
    desc: "Convert WebP back to JPEG for compatibility with tools that require it.",
  },
  {
    label: "WebP to PNG",
    href: "/webp-to-png",
    desc: "Convert WebP to PNG for lossless quality in graphics and UI assets.",
  },
  {
    label: "JPG to PNG",
    href: "/jpg-to-png",
    desc: "Convert JPEG to PNG when you need lossless quality or transparency.",
  },
  {
    label: "PNG to JPG",
    href: "/png-to-jpg",
    desc: "Convert PNG to JPEG to reduce file size for photographs and backgrounds.",
  },
  {
    label: "HEIC to JPG",
    href: "/heic-to-jpg",
    desc: "Convert iPhone HEIC photos to universally compatible JPEG format.",
  },
];

const conversionSteps = [
  {
    step: "1",
    title: "Open the Format Converter",
    desc: 'Go to snapbittools.com/image-format-converter or use any specific conversion tool (e.g., "JPG to WebP"). No account or installation needed.',
  },
  {
    step: "2",
    title: "Upload Your Image",
    desc: "Drag and drop your file onto the tool or click to browse. Supported inputs include JPEG, PNG, WebP, AVIF, HEIC, and more.",
  },
  {
    step: "3",
    title: "Select the Output Format",
    desc: "Choose your target format from the dropdown. For web use, WebP is the recommended default. AVIF is available where maximum compression is the priority.",
  },
  {
    step: "4",
    title: "Adjust Quality (Optional)",
    desc: "Fine-tune the output quality level using the slider. A setting of 80–85% typically gives the best balance of file size and visual fidelity.",
  },
  {
    step: "5",
    title: "Download the Converted File",
    desc: "Click Download to save your converted image. Everything processed in this step happened entirely in your browser — nothing was uploaded.",
  },
];

function BlogPage() {
  return (
    <div className="min-h-screen py-2 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-12 mt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm mb-5">
            <span className="bg-brand-primary/10 border border-brand-primary/30 rounded-full px-3 py-0.5 text-xs font-medium text-brand-primary">
              Image Optimization
            </span>
            <span className="text-theme-body">·</span>
            <time
              dateTime={PUBLISHED_DATE}
              className="text-theme-muted text-xs"
            >
              May 7, 2026
            </time>
            <span className="text-theme-body">·</span>
            <span className="text-theme-muted text-xs">10 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-heading leading-tight mb-6">
            Best Free Image Format Converter 2026: WebP vs AVIF vs JPEG
          </h1>

          <p className="text-lg text-theme-muted leading-relaxed">
            JPEG dominated the web for three decades. WebP changed the game. AVIF is rewriting it
            again. Here is a straight-to-the-point comparison of every major image format in 2026 —
            and a guide to converting between them for free, directly in your browser.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              S
            </div>
            <div>
              <p className="text-sm font-medium text-theme-heading">Siddhartha Mishra</p>
              <p className="text-xs text-theme-muted">SnapBit Tools</p>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        <nav
          className="mb-14 p-6 bg-theme-surface/50 border border-theme-border rounded-lg"
          aria-label="Article contents"
        >
          <h2 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">
            Table of Contents
          </h2>
          <ol className="space-y-2.5 text-sm">
            {tocItems.map(([href, text]) => (
              <li
                key={href}
                className="flex items-center gap-1.5"
              >
                <IconChevronRight className="w-3.5 h-3.5 text-theme-body shrink-0" />
                <a
                  href={href}
                  className="text-brand-primary hover:text-brand-hover hover:underline transition-colors"
                >
                  {text}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Article Body */}
        <article className="space-y-20">
          {/* ── Section 1: Format Overview ── */}
          <section
            id="format-overview"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              The Four Major Formats at a Glance
            </h2>
            <p className="text-theme-body leading-relaxed mb-8">
              Four image formats dominate the modern web: JPEG, PNG, WebP, and AVIF. Each has its
              own compression method, feature set, and ideal use case. Understanding the differences
              is the foundation of any serious image optimization workflow.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {formatOverview.map((fmt) => (
                <div
                  key={fmt.name}
                  className={`p-5 border rounded-lg ${fmt.badgeClass}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base tracking-wide">{fmt.name}</h3>
                    <span className="text-xs text-theme-muted">Since {fmt.year}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-theme-muted">
                    <li>
                      <span className="text-theme-muted">Compression:</span> {fmt.type}
                    </li>
                    <li>
                      <span className="text-theme-muted">Transparency:</span> {fmt.transparency}
                    </li>
                    <li>
                      <span className="text-theme-muted">Browser support:</span> {fmt.support}
                    </li>
                    <li>
                      <span className="text-theme-muted">Best for:</span> {fmt.idealFor}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 2: WebP Deep Dive ── */}
          <section
            id="webp-deep-dive"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              WebP: The Practical Web Standard
            </h2>
            <p className="text-theme-body leading-relaxed mb-5">
              Developed by Google and introduced in 2010, WebP was designed from the ground up as a
              replacement for both JPEG and PNG on the web. It supports both lossy and lossless
              compression, transparency, and animation — making it the most versatile modern format
              with reliable cross-browser support.
            </p>
            <p className="text-theme-body leading-relaxed mb-8">
              As of 2026, WebP is supported by 96%+ of all browsers, including all major desktop and
              mobile environments. There is almost no reason not to use it for new web projects.
            </p>

            <div className="space-y-3 mb-8">
              {[
                {
                  label: "25–35% smaller than JPEG",
                  detail: "at equivalent visual quality for photographs",
                  color: "text-[var(--theme-diff-added-text)]",
                },
                {
                  label: "26% smaller than lossless PNG",
                  detail: "when using WebP's lossless mode for graphics",
                  color: "text-[var(--theme-diff-added-text)]",
                },
                {
                  label: "Supports alpha transparency",
                  detail: "unlike JPEG, making it viable for icons and UI elements",
                  color: "text-brand-primary",
                },
                {
                  label: "Supports animation",
                  detail: "as a lighter alternative to GIF",
                  color: "text-brand-primary",
                },
                {
                  label: "Fast encoding",
                  detail: "suitable for batch processing large numbers of images",
                  color: "text-brand-primary",
                },
              ].map(({ label, detail, color }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 bg-theme-surface-muted border border-theme-border/40 rounded-lg"
                >
                  <span className={`font-semibold text-sm shrink-0 ${color}`}>+</span>
                  <div>
                    <span className="text-sm font-medium text-theme-heading">{label}</span>
                    <span className="text-sm text-theme-muted"> — {detail}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
              <p className="text-sm text-theme-body leading-relaxed">
                <span className="font-semibold text-brand-primary">Recommended tool:</span> Convert your
                JPEG photographs to WebP using{" "}
                <Link
                  to="/jpg-to-webp"
                  className="text-brand-primary hover:text-brand-hover hover:underline font-medium"
                >
                  SnapBit Tools JPG to WebP Converter
                </Link>
                , or convert PNG graphics using the{" "}
                <Link
                  to="/png-to-webp"
                  className="text-brand-primary hover:text-brand-hover hover:underline font-medium"
                >
                  PNG to WebP Converter
                </Link>
                . Both run entirely in your browser with no uploads.
              </p>
            </div>
          </section>

          {/* ── Section 3: AVIF Deep Dive ── */}
          <section
            id="avif-deep-dive"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              AVIF: The Performance Leader
            </h2>
            <p className="text-theme-body leading-relaxed mb-5">
              AVIF (AV1 Image File Format) is derived from the AV1 video codec and represents the
              current state-of-the-art in image compression. Released in 2019, it consistently
              outperforms WebP in compression ratios, particularly for photographs and high-detail
              images.
            </p>
            <p className="text-theme-body leading-relaxed mb-8">
              The tradeoff is encoding speed — AVIF encodes significantly slower than WebP or JPEG,
              which makes it impractical for real-time generation but perfectly suitable for
              pre-processing assets before deployment.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-theme-icon-bg border border-brand-primary/20 rounded-lg">
                <h3 className="font-semibold text-brand-primary mb-3 text-sm">Where AVIF excels</h3>
                <ul className="space-y-2 text-xs text-theme-muted">
                  {[
                    "40–55% smaller than JPEG at comparable quality",
                    "Supports HDR and wide color gamut",
                    "Best-in-class for high-detail photographs",
                    "Full transparency and animation support",
                    "Lossless mode available",
                  ].map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2"
                    >
                      <span className="text-brand-primary shrink-0">+</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 bg-theme-surface-muted border border-theme-border/40 rounded-lg">
                <h3 className="font-semibold text-theme-body mb-3 text-sm">
                  Where AVIF falls short
                </h3>
                <ul className="space-y-2 text-xs text-theme-muted">
                  {[
                    "Browser support ~85% (not yet universal)",
                    "Slow encoding — not ideal for real-time use",
                    "Limited tooling support compared to WebP",
                    "Requires fallback strategy for older browsers",
                  ].map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2"
                    >
                      <span className="text-[var(--theme-alert-error-text)] shrink-0">-</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-theme-body leading-relaxed">
              The consensus in 2026: AVIF is the format to move toward, especially for image-heavy
              e-commerce and media sites. For most teams, the practical approach is to use AVIF as
              the primary format where supported, with WebP as a fallback, and JPEG as the last
              resort.
            </p>
          </section>

          {/* ── Section 4: JPEG & PNG ── */}
          <section
            id="jpeg-png-still-relevant"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              JPEG and PNG: Still Relevant?
            </h2>
            <p className="text-theme-body leading-relaxed mb-6">
              Despite being decades old, JPEG and PNG are not going away. Their universal support,
              widespread tooling, and deep integration into software ecosystems keep them relevant —
              but their role is increasingly that of a baseline rather than the optimal choice.
            </p>

            <div className="space-y-4">
              <div className="p-5 bg-theme-surface-muted border border-theme-border/40 rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">
                  When JPEG is still the right choice
                </h3>
                <ul className="space-y-1.5 text-sm text-theme-muted mt-3">
                  {[
                    "Email clients that do not support WebP",
                    "Legacy CMS or software with strict format requirements",
                    "Social media platforms that re-encode images on upload anyway",
                    "When universal compatibility across all devices is non-negotiable",
                  ].map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2"
                    >
                      <span className="text-theme-muted shrink-0">—</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-theme-surface-muted border border-theme-border/40 rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">
                  When PNG is still the right choice
                </h3>
                <ul className="space-y-1.5 text-sm text-theme-muted mt-3">
                  {[
                    "Source files that need to be re-edited — lossless preserves full fidelity",
                    "Screenshots with text, which degrade visibly under lossy compression",
                    "Software that requires PNG specifically (design tools, icon pipelines)",
                    "When toolchain support for WebP or AVIF is not yet in place",
                  ].map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2"
                    >
                      <span className="text-theme-muted shrink-0">—</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-theme-body leading-relaxed mt-6">
              Need to convert between these legacy formats?{" "}
              <Link
                to="/jpg-to-png"
                className="text-brand-primary hover:text-brand-hover hover:underline"
              >
                JPG to PNG
              </Link>
              ,{" "}
              <Link
                to="/png-to-jpg"
                className="text-brand-primary hover:text-brand-hover hover:underline"
              >
                PNG to JPG
              </Link>
              , and{" "}
              <Link
                to="/heic-to-jpg"
                className="text-brand-primary hover:text-brand-hover hover:underline"
              >
                HEIC to JPG
              </Link>{" "}
              converters are all available free on SnapBit Tools — no uploads, no sign-up.
            </p>
          </section>

          {/* ── Section 5: Head-to-Head Table ── */}
          <section
            id="head-to-head"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              Head-to-Head Comparison Table
            </h2>
            <p className="text-theme-body leading-relaxed mb-6">
              A direct comparison across the criteria that matter most for web and production use:
            </p>

            <div className="overflow-x-auto rounded-lg border border-theme-border">
              <table className="w-full text-sm">
                <thead className="bg-theme-surface">
                  <tr className="border-b border-theme-border">
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">Criterion</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">JPEG</th>
                    <th className="text-left py-3 px-4 text-theme-muted font-medium">PNG</th>
                    <th className="text-left py-3 px-4 text-brand-primary font-medium">WebP</th>
                    <th className="text-left py-3 px-4 text-brand-primary font-medium">AVIF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {comparisonRows.map((row) => (
                    <tr
                      key={row.criterion}
                      className="hover:bg-theme-surface-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-theme-body font-medium text-xs">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-4 text-theme-muted text-xs">{row.jpeg}</td>
                      <td className="py-3 px-4 text-theme-muted text-xs">{row.png}</td>
                      <td className="py-3 px-4 text-theme-heading text-xs">{row.webp}</td>
                      <td className="py-3 px-4 text-theme-heading text-xs">{row.avif}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-theme-body mt-3">
              * Browser support figures based on global usage data as of May 2026. Encoding speed
              ratings are relative, not absolute.
            </p>
          </section>

          {/* ── Section 6: When to Use ── */}
          <section
            id="when-to-use"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              Which Format Should You Use?
            </h2>
            <p className="text-theme-body leading-relaxed mb-6">
              The right format depends on your context. Here is a practical decision guide:
            </p>

            <div className="space-y-3">
              {[
                {
                  scenario: "New website or web app",
                  recommendation:
                    "WebP for all images; AVIF where your build pipeline supports it. Use JPEG as fallback only.",
                  color: "border-brand-primary/30 bg-brand-primary/10",
                  label: "WebP / AVIF",
                  labelColor: "text-brand-primary",
                },
                {
                  scenario: "E-commerce product images",
                  recommendation:
                    "AVIF for main product shots where supported, WebP otherwise. Smaller images mean faster pages and better conversion rates.",
                  color: "border-brand-primary/20 bg-theme-icon-bg",
                  label: "AVIF / WebP",
                  labelColor: "text-brand-primary",
                },
                {
                  scenario: "Logos, icons, and UI assets with transparency",
                  recommendation:
                    "WebP lossless or PNG. AVIF lossless is also excellent but WebP has broader tooling support.",
                  color: "border-brand-primary/30 bg-brand-primary/10",
                  label: "WebP / PNG",
                  labelColor: "text-brand-primary",
                },
                {
                  scenario: "Email newsletters",
                  recommendation:
                    "JPEG. Email clients have inconsistent WebP support. Stick to JPEG for maximum compatibility.",
                  color: "border-theme-border bg-theme-surface-muted",
                  label: "JPEG",
                  labelColor: "text-theme-muted",
                },
                {
                  scenario: "iPhone photos (HEIC) for sharing",
                  recommendation:
                    "Convert to JPEG first for universal compatibility, then to WebP if you're publishing on the web.",
                  color: "border-theme-border bg-theme-surface-muted",
                  label: "JPEG / WebP",
                  labelColor: "text-theme-muted",
                },
                {
                  scenario: "Source / archival files",
                  recommendation:
                    "PNG or lossless WebP. Never use lossy formats for files you will re-edit later.",
                  color: "border-theme-border bg-[var(--theme-diff-added-bg)]",
                  label: "PNG",
                  labelColor: "text-[var(--theme-diff-added-text)]",
                },
              ].map(({ scenario, recommendation, color, label, labelColor }) => (
                <div
                  key={scenario}
                  className={`p-5 border rounded-lg ${color}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-theme-heading text-sm">{scenario}</h3>
                    <span className={`text-xs font-bold shrink-0 ${labelColor}`}>{label}</span>
                  </div>
                  <p className="text-xs text-theme-muted leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 7: How to Convert ── */}
          <section
            id="how-to-convert"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              How to Convert Image Formats for Free
            </h2>
            <p className="text-theme-body leading-relaxed mb-8">
              SnapBit Tools provides a full set of free, browser-based image format converters.
              Every conversion happens locally in your browser — no files are uploaded to any
              server, no account is required, and there are no usage limits.
            </p>

            {/* Step by step */}
            <div className="space-y-4 mb-12">
              {conversionSteps.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex gap-4 p-5 bg-theme-surface-muted border border-theme-border/40 rounded-lg hover:border-brand-primary/30 hover:bg-theme-surface transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold text-sm shrink-0">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-theme-heading mb-1">{title}</h3>
                    <p className="text-sm text-theme-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="mb-10">
              <Link
                to="/image-format-converter"
                className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-3 group")}
              >
                Open Image Format Converter — Free
                <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Conversion links grid */}
            <h3 className="text-lg font-semibold text-theme-heading mb-4">
              All Available Conversion Tools
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {conversionTools.map(({ label, href, desc }) => (
                <Link
                  key={href}
                  to={href}
                  className="p-4 bg-theme-surface-muted border border-theme-border/40 rounded-lg hover:border-brand-primary/30 hover:bg-theme-surface transition-all duration-200 group block"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-theme-heading group-hover:text-brand-primary transition-colors">
                      {label}
                    </span>
                    <IconChevronRight className="w-3.5 h-3.5 text-theme-body group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-theme-muted leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>

            {/* Secondary CTA */}
            <div className="mt-8 p-5 bg-theme-surface-muted border border-theme-border/40 rounded-lg">
              <p className="text-sm text-theme-body leading-relaxed">
                Once converted, you can reduce file sizes further with the{" "}
                <Link
                  to="/image-compressor"
                  className="text-brand-primary hover:text-brand-hover hover:underline font-medium"
                >
                  SnapBit Tools Image Compressor
                </Link>
                . Combining format conversion and compression is the most effective way to minimize
                image weight for web delivery.
              </p>
            </div>
          </section>

          {/* ── FAQ Section ── */}
          <section
            id="faqs"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-theme-surface-muted border border-theme-border rounded-lg p-6 cursor-pointer hover:border-brand-primary/50 hover:bg-theme-surface transition-all duration-200"
                >
                  <summary className="font-semibold text-base flex items-center justify-between text-theme-heading cursor-pointer list-none">
                    {faq.question}
                    <IconChevronDown className="w-5 h-5 text-theme-muted group-open:rotate-180 transition-transform duration-300 shrink-0 ml-3" />
                  </summary>
                  <p className="mt-4 text-theme-body leading-relaxed text-sm">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section>
            <div className="p-6 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-center">
              <h2 className="text-lg sm:text-xl font-bold text-theme-heading mb-3">
                Convert Your Images Now — Free
              </h2>
              <p className="text-theme-muted mb-6 text-sm max-w-md mx-auto leading-relaxed">
                No uploads. No sign-up. No limits. SnapBit Tools converts between every major image
                format directly in your browser with full privacy.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/image-format-converter"
                  className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-2.5 group text-sm")}
                >
                  Format Converter
                  <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/image-compressor"
                  className={cn(tc.btnSecondary, "inline-flex items-center gap-2 font-semibold px-6 py-2.5 group text-sm")}
                >
                  Image Compressor
                  <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </article>

        {/* Related Tools */}
        <div className="mt-20">
          <RelatedTools
            currentToolSlug="image-format-converter"
            category="Images"
            maxTools={4}
          />
        </div>
      </div>
    </div>
  );
}
