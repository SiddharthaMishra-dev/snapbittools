import { createFileRoute, Link } from "@tanstack/react-router";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

import RelatedTools from "@/components/RelatedTools";
import { getSeoMetadata } from "@/lib/seo";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const PUBLISHED_DATE = "2026-08-11";
const MODIFIED_DATE = "2026-08-11";
const SITE = "https://snapbittools.com";
const PATH = "/compress-image-for-web-without-quality-loss";

const faqs = [
  {
    question: "How do I compress an image for the web without losing quality?",
    answer:
      "Use a quality-aware compressor and keep settings in the “visually lossless” range — typically 75–90% for JPEG/WebP, or lossless/high-color PNG for graphics. Resize oversized originals first, then compress with SnapBit Tools’ free image compressor at snapbittools.com/image-compressor. Preview the result before downloading.",
  },
  {
    question: "What is the best quality setting to compress images for websites?",
    answer:
      "For photographs, 80–85% JPEG or WebP quality is the sweet spot for most sites — files shrink dramatically while looking identical on screen. For logos and UI with sharp edges or transparency, prefer PNG lossless or WebP lossless instead of aggressive JPEG compression.",
  },
  {
    question: "Does compressing images for web help SEO?",
    answer:
      "Yes. Smaller images improve Largest Contentful Paint (LCP) and overall page weight. Google uses Core Web Vitals as ranking signals, so compressing images for the web without visible quality loss can improve both rankings and conversions.",
  },
  {
    question: "Should I convert JPG to WebP when optimizing for the web?",
    answer:
      "Usually yes. WebP is typically 25–35% smaller than JPEG at the same visual quality and is supported by all modern browsers. Use SnapBit’s format converter or JPG to WebP tool, then keep JPEG as a fallback only if you must support very old clients.",
  },
  {
    question: "Can I compress PNG without losing quality?",
    answer:
      "Yes. Lossless PNG compression (or high palette settings for simple graphics) reduces file size without changing pixels. For photo-like PNGs, converting to WebP or JPEG at high quality often yields much smaller files with no visible difference on a website.",
  },
  {
    question: "Is SnapBit’s image compressor safe and private?",
    answer:
      "Yes. Compression runs entirely in your browser. Your images are never uploaded to SnapBit servers, so you can optimize product photos, client work, and personal files without privacy risk.",
  },
  {
    question: "How small should website images be?",
    answer:
      "Aim for hero images under ~200–300 KB when possible, content photos under 100–150 KB, and thumbnails under 50 KB — while keeping dimensions appropriate for the display size (don’t serve a 4000px photo in a 400px slot).",
  },
];

const tocItems: [string, string][] = [
  ["#why-compress-for-web", "Why Compress Images for Websites?"],
  ["#lossy-vs-lossless", "Lossy vs Lossless: What “Without Quality Loss” Really Means"],
  ["#before-after", "Before & After: Realistic Compression Examples"],
  ["#choose-format", "Choose the Right Format for Web Images"],
  ["#step-by-step", "Step-by-Step: Compress Images for Web Without Losing Quality"],
  ["#quality-settings", "Recommended Quality Settings by Image Type"],
  ["#common-mistakes", "Common Mistakes That Ruin Image Quality"],
  ["#workflow", "A Complete Website Image Optimization Workflow"],
  ["#faqs", "Frequently Asked Questions"],
];

const steps = [
  {
    step: "1",
    title: "Resize to the size you actually display",
    desc: "If your layout shows a 1200px-wide hero, don’t upload a 4000px camera original. Use the Image Resizer to set the correct width first — this alone can cut file size by 50%+ with zero quality trade-off on screen.",
  },
  {
    step: "2",
    title: "Open SnapBit Image Compressor",
    desc: "Go to snapbittools.com/image-compressor. No signup, no upload to a server — processing stays in your browser.",
  },
  {
    step: "3",
    title: "Upload JPG, PNG, WebP, or AVIF files",
    desc: "Drag one image or a whole batch. Batch mode is ideal when optimizing a blog post, product catalog, or landing page in one pass.",
  },
  {
    step: "4",
    title: "Set quality in the visually lossless range",
    desc: "Start around 80–90%. For PNG graphics, keep quality high (or lossless). Compare the preview — if you can’t see a difference at normal zoom, you’ve found the right setting.",
  },
  {
    step: "5",
    title: "Pick the best output format",
    desc: "Keep PNG for logos with transparency. For photos, convert to WebP (or JPEG if you need maximum compatibility) for smaller web delivery.",
  },
  {
    step: "6",
    title: "Download and deploy",
    desc: "Download individual files or a ZIP of the batch. Replace the heavy originals on your site, CMS, or CDN — then re-check page speed.",
  },
];

const beforeAfterRows = [
  {
    type: "Hero photo (JPEG)",
    before: "4.1 MB · 4000×2667",
    after: "186 KB · 1600×1067 WebP @ 82%",
    savings: "95%",
    note: "Visually identical on a 1440p laptop display",
  },
  {
    type: "Blog featured image",
    before: "2.4 MB · JPEG export",
    after: "94 KB · WebP @ 80%",
    savings: "96%",
    note: "No visible banding or artifacts at 100% zoom in-browser",
  },
  {
    type: "Product PNG (transparency)",
    before: "1.6 MB · PNG",
    after: "210 KB · WebP lossless / optimized PNG",
    savings: "87%",
    note: "Alpha channel preserved for store layouts",
  },
  {
    type: "UI icon set (PNG)",
    before: "380 KB · PNG",
    after: "96 KB · PNG (lossless / palette)",
    savings: "75%",
    note: "Sharp edges retained — avoid JPEG for icons",
  },
];

const formatGuide = [
  {
    format: "WebP",
    use: "Default for most website photos & graphics",
    tip: "25–35% smaller than JPEG at the same perceived quality",
  },
  {
    format: "JPEG",
    use: "Photos when you need maximum compatibility",
    tip: "Use 80–85% quality; avoid re-saving JPEG repeatedly",
  },
  {
    format: "PNG",
    use: "Logos, screenshots with text, transparency",
    tip: "Prefer lossless or careful palette compression — not photo-style JPEG",
  },
  {
    format: "AVIF",
    use: "Cutting-edge performance where supported",
    tip: "Often smaller than WebP; pair with a WebP/JPEG fallback if needed",
  },
];

const qualitySettings = [
  {
    type: "Photographs & heroes",
    format: "WebP or JPEG",
    quality: "80–85%",
    extra: "Resize to display width first",
  },
  {
    type: "E-commerce product shots",
    format: "WebP (+ JPEG fallback)",
    quality: "82–88%",
    extra: "Keep zoom-friendly dimensions for detail views",
  },
  {
    type: "Logos & icons",
    format: "PNG or WebP lossless",
    quality: "Lossless / 95–100%",
    extra: "Never use heavy JPEG on text or flat color",
  },
  {
    type: "Screenshots & UI",
    format: "PNG or WebP",
    quality: "Lossless or 90%+",
    extra: "Preserve crisp edges and small type",
  },
  {
    type: "Thumbnails & cards",
    format: "WebP",
    quality: "70–80%",
    extra: "Small display size forgives more compression",
  },
];

const mistakes = [
  {
    title: "Serving full-resolution camera files",
    fix: "Resize with the Image Resizer so pixel dimensions match the layout before you compress.",
  },
  {
    title: "Using PNG for photographs",
    fix: "Convert photo PNGs to WebP or JPEG — PNG is inefficient for complex photos.",
  },
  {
    title: "Crushing quality to 40% “just to be safe”",
    fix: "Start at 80–85%. Drop further only if file size targets require it and the preview still looks clean.",
  },
  {
    title: "Uploading to random online compressors",
    fix: "Prefer client-side tools like SnapBit so sensitive images never leave your device.",
  },
  {
    title: "Skipping format conversion",
    fix: "Modern formats (WebP/AVIF) often beat “same format, lower quality” for web delivery.",
  },
];

export const Route = createFileRoute("/_wrap/compress-image-for-web-without-quality-loss")({
  head: () =>
    getSeoMetadata({
      title: "How to Compress Images for Website Without Losing Quality (Step-by-Step)",
      description:
        "Learn how to compress image for web without quality loss. Step-by-step guide with quality settings, format tips, before/after examples, and SnapBit’s free private image compressor.",
      keywords: [
        "compress image for web without quality loss",
        "compress images for website",
        "compress image without losing quality",
        "optimize images for web",
        "website image compression guide",
        "best quality settings for web images",
        "compress jpg for website",
        "compress png without quality loss",
        "webp compression for web",
        "reduce image size for website",
        "image optimization SEO",
        "free image compressor no upload",
        "snapbittools image compressor",
        "how to compress images for web",
        "visually lossless image compression",
      ],
      url: PATH,
      type: "website",
      faqs,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blogs", path: "/blogs" },
        {
          name: "Compress Images for Website Without Losing Quality",
          path: PATH,
        },
      ],
      schema: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "How to Compress Images for Website Without Losing Quality (Step-by-Step)",
        description:
          "A practical SEO-focused guide to compress images for the web without visible quality loss — including formats, quality settings, before/after examples, and a SnapBit Tools workflow.",
        url: `${SITE}${PATH}`,
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
          url: SITE,
          logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
        },
        image: `${SITE}/screenshot.png`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE}${PATH}`,
        },
        keywords: "compress image for web without quality loss, website image compression, optimize images for web, snapbittools",
        articleSection: "Image Optimization",
        inLanguage: "en-US",
        wordCount: 1950,
        about: {
          "@type": "Thing",
          name: "Website image compression",
          description: "Techniques for reducing image file size for websites while preserving visual quality",
        },
      },
    }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="min-h-screen py-2 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 mt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm mb-5">
            <span className="bg-brand-primary/10 border border-brand-primary/30 rounded-full px-3 py-0.5 text-xs font-medium text-brand-primary">
              Image Optimization
            </span>
            <span className="text-theme-body">·</span>
            <time dateTime={PUBLISHED_DATE} className="text-theme-muted text-xs">
              August 11, 2026
            </time>
            <span className="text-theme-body">·</span>
            <span className="text-theme-muted text-xs">12 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-heading leading-tight mb-6">
            How to Compress Images for Website Without Losing Quality (Step-by-Step)
          </h1>

          <p className="text-lg text-theme-muted leading-relaxed">
            Want to <strong className="text-theme-heading font-medium">compress image for web without quality loss</strong>? This guide
            shows the exact workflow — resize correctly, pick the right format, use visually lossless settings, and ship faster pages with{" "}
            <a href={`${SITE}/image-compressor`} className="text-brand-primary hover:text-brand-hover hover:underline">
              SnapBit Tools
            </a>
            .
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              S
            </div>
            <div>
              <p className="text-sm font-medium text-theme-heading">Siddhartha Mishra</p>
              <p className="text-xs text-theme-muted">
                <a href={SITE} className="hover:text-brand-primary transition-colors">
                  SnapBit Tools
                </a>
              </p>
            </div>
          </div>
        </header>

        <div className="mb-10 p-5 bg-brand-primary/10 border border-brand-primary/30 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-theme-body leading-relaxed">Skip ahead: compress images in your browser — private, free, no upload.</p>
          <Link
            to="/image-compressor"
            className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-5 py-2.5 shrink-0 group")}
          >
            Open Image Compressor
            <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <nav className="mb-14 p-6 bg-theme-surface/50 border border-theme-border rounded-lg" aria-label="Article contents">
          <h2 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-4">Table of Contents</h2>
          <ol className="space-y-2.5 text-sm">
            {tocItems.map(([href, text]) => (
              <li key={href} className="flex items-center gap-1.5">
                <IconChevronRight className="w-3.5 h-3.5 text-theme-body shrink-0" />
                <a href={href} className="text-brand-primary hover:text-brand-hover hover:underline transition-colors">
                  {text}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="space-y-20">
          <section id="why-compress-for-web" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Why Compress Images for Websites?</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              On most websites, images are the heaviest assets — often more than half of total page weight. Unoptimized photos slow Largest
              Contentful Paint, waste mobile data, and push visitors away before your content loads.
            </p>
            <p className="text-theme-body leading-relaxed mb-4">
              The goal of website image compression is not “smallest file at any cost.” It is{" "}
              <strong className="text-theme-heading">the smallest file that still looks sharp on the devices your audience uses</strong>.
              That is what people mean by compress image for web without quality loss: visually lossless results, not necessarily
              bit-identical files.
            </p>
            <p className="text-theme-body leading-relaxed">
              Done right, compression also supports SEO. Faster pages score better on Core Web Vitals, and leaner image payloads keep
              hosting and CDN bills under control. If you want a deeper dive into why file size matters, read{" "}
              <Link to="/reduce-your-image-size-for-free" className="text-brand-primary hover:text-brand-hover hover:underline">
                why image compression matters
              </Link>
              .
            </p>
          </section>

          <section id="lossy-vs-lossless" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              Lossy vs Lossless: What “Without Quality Loss” Really Means
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">Lossless compression</h3>
                <p className="text-sm text-theme-muted leading-relaxed">
                  Rebuilds the same pixels more efficiently. Perfect for logos, icons, and UI. PNG and lossless WebP fit here. Savings are
                  real but smaller than lossy methods on photos.
                </p>
              </div>
              <div className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">Visually lossless (lossy)</h3>
                <p className="text-sm text-theme-muted leading-relaxed">
                  Discards detail the human eye rarely notices at normal viewing size. JPEG and lossy WebP at 80–90% quality usually look
                  identical to the original on a website — with dramatically smaller files.
                </p>
              </div>
            </div>
            <p className="text-theme-body leading-relaxed">
              For web delivery, “without losing quality” almost always means <em>no visible quality loss</em>. That is the standard
              professional sites aim for — and the standard this guide uses.
            </p>
          </section>

          <section id="before-after" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Before &amp; After: Realistic Compression Examples</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              Typical results when you resize to display size and compress with sensible, high-quality settings:
            </p>

            <div className="overflow-x-auto rounded-lg border border-theme-border">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-theme-surface">
                  <tr className="border-b border-theme-border">
                    {["Image type", "Before", "After", "Savings", "Visual result"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-theme-muted font-medium text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {beforeAfterRows.map((row) => (
                    <tr key={row.type} className="hover:bg-theme-surface-muted/20 transition-colors">
                      <td className="py-3 px-3 text-theme-heading font-medium text-xs">{row.type}</td>
                      <td className="py-3 px-3 text-theme-muted text-xs">{row.before}</td>
                      <td className="py-3 px-3 text-theme-body text-xs">{row.after}</td>
                      <td className="py-3 px-3 text-[var(--theme-diff-added-text)] font-semibold text-xs">{row.savings}</td>
                      <td className="py-3 px-3 text-theme-muted text-xs">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-theme-muted mt-3">
              Figures are representative. Your savings depend on content, noise, and how oversized the original export is.
            </p>
          </section>

          <section id="choose-format" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Choose the Right Format for Web Images</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              Format choice often saves more bytes than lowering quality. Use this quick guide, then convert with the{" "}
              <Link to="/image-format-converter" className="text-brand-primary hover:text-brand-hover hover:underline">
                Image Format Converter
              </Link>{" "}
              or dedicated routes like{" "}
              <Link to="/jpg-to-webp" className="text-brand-primary hover:text-brand-hover hover:underline">
                JPG to WebP
              </Link>{" "}
              and{" "}
              <Link to="/png-to-webp" className="text-brand-primary hover:text-brand-hover hover:underline">
                PNG to WebP
              </Link>
              .
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {formatGuide.map(({ format, use, tip }) => (
                <div key={format} className="p-5 bg-theme-surface-muted border border-theme-border/40 rounded-lg">
                  <h3 className="font-bold text-theme-heading text-sm uppercase tracking-wider mb-2">{format}</h3>
                  <p className="text-xs text-brand-primary mb-2">{use}</p>
                  <p className="text-xs text-theme-muted leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-theme-muted mt-6">
              Still deciding between formats? See our{" "}
              <Link to="/best-free-image-format-converter-2026" className="text-brand-primary hover:text-brand-hover hover:underline">
                WebP vs AVIF vs JPEG comparison
              </Link>
              .
            </p>
          </section>

          <section id="step-by-step" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              Step-by-Step: Compress Images for Web Without Losing Quality
            </h2>
            <p className="text-theme-body leading-relaxed mb-8">
              Follow this sequence whenever you prepare assets for a site, store, or landing page. It prioritizes dimension control first,
              then quality-aware compression — the order that prevents both blurry results and bloated files.
            </p>

            <div className="space-y-4 mb-10">
              {steps.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex gap-4 p-5 bg-theme-surface-muted border border-theme-border/40 rounded-lg hover:border-brand-primary/30 transition-all"
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

            <div className="flex flex-wrap gap-3">
              <Link to="/image-compressor" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-3 group")}>
                Compress Images Free
                <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/image-resizer" className={cn(tc.btnSecondary, "inline-flex items-center gap-2 font-semibold px-6 py-3")}>
                Open Image Resizer
              </Link>
            </div>
          </section>

          <section id="quality-settings" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Recommended Quality Settings by Image Type</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              Use these starting points in{" "}
              <Link to="/image-compressor" className="text-brand-primary hover:text-brand-hover hover:underline">
                SnapBit Image Compressor
              </Link>
              , then nudge the slider only if the preview shows artifacts or you still miss a size target.
            </p>

            <div className="overflow-x-auto rounded-lg border border-theme-border">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-theme-surface">
                  <tr className="border-b border-theme-border">
                    {["Use case", "Format", "Quality", "Extra tip"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-theme-muted font-medium text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {qualitySettings.map((row) => (
                    <tr key={row.type} className="hover:bg-theme-surface-muted/20 transition-colors">
                      <td className="py-3 px-3 text-theme-heading font-medium text-xs">{row.type}</td>
                      <td className="py-3 px-3 text-theme-body text-xs">{row.format}</td>
                      <td className="py-3 px-3 text-brand-primary font-semibold text-xs">{row.quality}</td>
                      <td className="py-3 px-3 text-theme-muted text-xs">{row.extra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="common-mistakes" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Common Mistakes That Ruin Image Quality</h2>
            <div className="space-y-3">
              {mistakes.map(({ title, fix }) => (
                <div key={title} className="p-5 border border-theme-border rounded-lg bg-theme-surface">
                  <h3 className="font-semibold text-theme-heading text-sm mb-1.5">{title}</h3>
                  <p className="text-sm text-theme-muted leading-relaxed">{fix}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="workflow" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">A Complete Website Image Optimization Workflow</h2>
            <p className="text-theme-body leading-relaxed mb-6">For a full page or product launch, chain SnapBit tools in this order:</p>
            <ol className="space-y-4 text-theme-body list-decimal list-inside mb-8">
              <li>
                <Link to="/image-cropper" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  Crop
                </Link>{" "}
                to the final composition (hero, square card, thumbnail).
              </li>
              <li>
                <Link to="/image-resizer" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  Resize
                </Link>{" "}
                to the largest size you will actually serve (plus 2× only if you need retina).
              </li>
              <li>
                Convert photos to WebP with the{" "}
                <Link to="/image-format-converter" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  format converter
                </Link>{" "}
                when helpful.
              </li>
              <li>
                <Link to="/image-compressor" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  Compress
                </Link>{" "}
                at visually lossless quality and download a ZIP for the whole batch.
              </li>
            </ol>
            <p className="text-theme-body leading-relaxed mb-6">
              Comparing compressors? See{" "}
              <Link to="/best-image-compressor-tool-2026" className="text-brand-primary hover:text-brand-hover hover:underline">
                SnapBit vs TinyPNG, Squoosh &amp; more
              </Link>{" "}
              for a privacy- and limits-focused breakdown.
            </p>
            <div className={cn(tc.diffAdded, "p-6 border border-theme-border rounded-lg")}>
              <h3 className="font-semibold text-[var(--theme-diff-added-text)] mb-3">Why teams use SnapBit for web image compression</h3>
              <ul className="space-y-2 text-sm text-theme-body">
                {[
                  "100% browser-based — no uploads to snapbittools.com",
                  "Batch compress + ZIP download with no monthly cap",
                  "Quality control for JPEG/WebP and smart PNG optimization",
                  "Works alongside resizer, cropper, and format converters in one suite",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[var(--theme-diff-added-text)] shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="faqs" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-theme-surface-muted border border-theme-border rounded-lg p-6 cursor-pointer hover:border-brand-primary/50 transition-all"
                >
                  <summary className="font-semibold text-base flex items-center justify-between text-theme-heading cursor-pointer list-none">
                    {faq.question}
                    <IconChevronDown className="w-5 h-5 text-theme-muted group-open:rotate-180 transition-transform shrink-0 ml-3" />
                  </summary>
                  <p className="mt-4 text-theme-body leading-relaxed text-sm">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <div className="p-6 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-center">
              <h2 className="text-lg sm:text-xl font-bold text-theme-heading mb-3">
                Compress Images for Your Website — Free &amp; Private
              </h2>
              <p className="text-theme-muted mb-5 text-sm max-w-lg mx-auto leading-relaxed">
                Use{" "}
                <a href={SITE} className="text-brand-primary hover:underline">
                  snapbittools.com
                </a>{" "}
                to compress image files for the web without visible quality loss. No signup. No uploads. Just faster pages.
              </p>
              <Link to="/image-compressor" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-8 py-3 group")}>
                Try SnapBit Image Compressor
                <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </section>
        </article>

        <div className="mt-20">
          <RelatedTools currentToolSlug="image-compressor" category="Images" maxTools={4} />
        </div>
      </div>
    </div>
  );
}
