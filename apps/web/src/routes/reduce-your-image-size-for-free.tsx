import { createFileRoute, Link } from "@tanstack/react-router";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedTools from "@/components/RelatedTools";
import { getSeoMetadata } from "@/lib/seo";

const PUBLISHED_DATE = "2026-03-19";
const MODIFIED_DATE = "2026-03-19";

const faqs = [
  {
    question: "What is image compression?",
    answer:
      "Image compression is the process of reducing an image file's size by eliminating redundant or less perceptible data. The goal is a smaller file that retains as much visual quality as possible — indistinguishable from the original for most everyday uses.",
  },
  {
    question: "Will compressing images reduce their quality?",
    answer:
      "It depends on the compression type. Lossy compression (common for JPEG) reduces file size significantly but may slightly reduce quality at very high compression levels. Lossless compression (used for PNG) reduces size without any quality loss. SnapBit Tools lets you control the quality level so you can find the perfect balance.",
  },
  {
    question: "How much can I reduce my image file size?",
    answer:
      "Generally, you can reduce image file sizes by 40–80% without any noticeable quality loss for screen display. The exact savings depend on the original image, format, and chosen compression level.",
  },
  {
    question: "Is it safe to compress images online with SnapBit Tools?",
    answer:
      "Absolutely. SnapBit Tools processes images entirely in your browser using client-side JavaScript. Your images are never uploaded to any server — they stay completely private and secure on your device.",
  },
  {
    question: "What image formats does SnapBit's image compressor support?",
    answer:
      "SnapBit Tools supports compressing JPEG, PNG, WebP, and AVIF images. You can also convert images to a different format during compression to maximize savings.",
  },
  {
    question: "Does image compression help with SEO?",
    answer:
      "Yes — positively! Smaller images lead to faster page load times, which is a direct Google ranking factor. Google's Core Web Vitals (especially Largest Contentful Paint) improve when images are properly compressed, potentially boosting your search rankings.",
  },
  {
    question: "Can I compress multiple images at once?",
    answer:
      "Yes. SnapBit Tools supports batch compression — you can upload multiple images, compress them all at once, and download the results as a ZIP file.",
  },
];

export const Route = createFileRoute("/reduce-your-image-size-for-free")({
  head: () =>
    getSeoMetadata({
      title: "Why Image Compression Matters & How to Reduce Image Size | SnapBit Tools Blog",
      description:
        "Learn why image compression is essential for web performance, SEO, and user experience. Step-by-step guide to reducing image file sizes for free using SnapBit Tools' online image compressor.",
      keywords: [
        "why compress images",
        "image compression benefits",
        "how to reduce image size",
        "image compression for web",
        "free image compressor",
        "reduce image file size",
        "compress images online free",
        "image optimization SEO",
        "website performance images",
        "compress jpg png webp online",
        "client-side image compression",
        "snapbittools image compressor",
        "image compressor no upload",
        "bulk image compressor free",
        "reduce image size without quality loss",
      ],
      url: "/reduce-your-image-size-for-free",
      type: "website",
      faqs,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blogs", path: "/blogs" },
        { name: "Reduce Your Image Size for Free", path: "/reduce-your-image-size-for-free" },
      ],
      schema: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "Why Image Compression Matters — And How to Reduce Your Image Size for Free",
        description:
          "A comprehensive guide on why image compression is essential for web performance and SEO, with a step-by-step tutorial on using SnapBit Tools' free, private, browser-based image compressor.",
        url: "https://snapbittools.com/reduce-your-image-size-for-free",
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
          "@id": "https://snapbittools.com/reduce-your-image-size-for-free",
        },
        keywords:
          "image compression, reduce image size, compress images online, web performance, SEO images, free image compressor, snapbittools",
        articleSection: "Image Optimization",
        inLanguage: "en-US",
        wordCount: 1800,
        about: {
          "@type": "Thing",
          name: "Image Compression",
          description: "The process of reducing image file sizes for faster web performance",
        },
      },
    }),
  component: BlogPage,
});

const steps = [
  {
    step: "1",
    title: "Go to the Image Compressor",
    desc: "Navigate to snapbittools.com/image-compressor in any modern browser. The tool works entirely in your browser — no downloads or sign-ups needed.",
  },
  {
    step: "2",
    title: "Upload Your Images",
    desc: "Drag and drop your images onto the tool, or click to select files. You can upload multiple images at once for batch compression.",
  },
  {
    step: "3",
    title: "Adjust Compression Settings",
    desc: "Use the quality slider to control the balance between file size and visual quality. Most images look great at 70–80% quality while saving over 60% of file size.",
  },
  {
    step: "4",
    title: "Choose Output Format (Optional)",
    desc: "Want maximum savings? Convert your images to WebP or AVIF format to achieve even smaller file sizes than JPEG or PNG.",
  },
  {
    step: "5",
    title: "Download Your Compressed Images",
    desc: "Click download to save individual files, or use 'Download All' to get a ZIP archive containing all your compressed images at once.",
  },
];

const reasons = [
  {
    number: "01",
    title: "Faster Page Load Times",
    desc: "Studies show that a one-second delay in page load time can cause a 7% drop in conversions. Smaller images translate directly to faster load speeds, keeping visitors engaged instead of bouncing.",
    colorClass: "bg-blue-900/10 border-blue-500/20",
    numberClass: "text-blue-400",
  },
  {
    number: "02",
    title: "Better Search Engine Rankings",
    desc: "Google uses page speed as a ranking factor. Properly optimized images improve your Core Web Vitals — particularly Largest Contentful Paint (LCP) — which directly impacts how Google ranks your pages.",
    colorClass: "bg-blue-900/10 border-blue-500/20",
    numberClass: "text-blue-400",
  },
  {
    number: "03",
    title: "Reduced Bandwidth & Hosting Costs",
    desc: "Every byte you shave off an image reduces server bandwidth on every page load. For high-traffic sites, this can translate to significant savings on hosting and CDN costs.",
    colorClass: "bg-blue-900/10 border-blue-500/20",
    numberClass: "text-blue-400",
  },
  {
    number: "04",
    title: "Better Mobile Experience",
    desc: "Mobile users often browse on slower data connections. Compressed images load significantly faster on mobile, reducing frustration and unnecessary data usage for your visitors.",
    colorClass: "bg-blue-900/10 border-blue-500/20",
    numberClass: "text-blue-400",
  },
  {
    number: "05",
    title: "Improved Email Deliverability",
    desc: "Large embedded images in emails cause them to land in spam or take forever to load. Compressing email images ensures your campaigns render fast and consistently reach inboxes.",
    colorClass: "bg-blue-900/10 border-blue-500/20",
    numberClass: "text-blue-400",
  },
];

const formatCards = [
  {
    format: "JPEG",
    best: "Photographs & complex images",
    pro: "Excellent compression ratio, universal support",
    con: "Lossy — quality degrades at very high compression",
  },
  {
    format: "PNG",
    best: "Logos, icons, and graphics with transparency",
    pro: "Lossless — no quality loss, supports transparency",
    con: "Larger file sizes than JPEG for photos",
  },
  {
    format: "WebP",
    best: "Web images (modern browsers)",
    pro: "25–35% smaller than JPEG at same quality, supports transparency",
    con: "Older browsers may not support it",
  },
  {
    format: "AVIF",
    best: "Next-gen web images",
    pro: "Smallest file sizes with excellent quality retention",
    con: "Limited browser support compared to WebP",
  },
];

const compressionStats = [
  { format: "JPEG (photo)", original: "3.2 MB", compressed: "420 KB", savings: "~87%" },
  { format: "PNG (graphic)", original: "1.8 MB", compressed: "540 KB", savings: "~70%" },
  { format: "WebP (photo)", original: "3.2 MB", compressed: "280 KB", savings: "~91%" },
  { format: "AVIF (photo)", original: "3.2 MB", compressed: "180 KB", savings: "~94%" },
];

function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />

        {/* Article Header */}
        <header className="mb-12 mt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm mb-5">
            <span className="bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-0.5 text-xs font-medium text-blue-400">
              Image Optimization
            </span>
            <span className="text-gray-600">·</span>
            <time dateTime={PUBLISHED_DATE} className="text-gray-500 text-xs">
              March 19, 2026
            </time>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 text-xs">8 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 leading-tight mb-6">
            Why Image Compression Matters — And How to Reduce Your Image Size for Free
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed">
            Large images slow down your website, hurt your search rankings, and frustrate users. Here's everything you need to know about
            image compression — and how to shrink your files in seconds using SnapBit Tools.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              S
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Siddhartha Mishra</p>
              <p className="text-xs text-gray-500">SnapBit Tools</p>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="mb-14 p-6 bg-gray-900/50 border border-gray-700/50 rounded-lg" aria-label="Article contents">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Table of Contents</h2>
          <ol className="space-y-2.5 text-sm">
            {[
              ["#what-is-image-compression", "What Is Image Compression?"],
              ["#why-it-matters", "Why Image Compression Matters"],
              ["#how-much-can-you-save", "How Much Can You Actually Save?"],
              ["#formats-explained", "Image Formats Explained"],
              ["#step-by-step", "How to Compress Images with SnapBit Tools"],
              ["#privacy-matters", "Privacy First: Why No-Upload Tools Are Better"],
              ["#faqs", "Frequently Asked Questions"],
            ].map(([href, text]) => (
              <li key={href} className="flex items-center gap-1.5">
                <IconChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                <a href={href} className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  {text}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Article Body */}
        <article className="space-y-20">
          {/* ── Section 1: What Is Image Compression ── */}
          <section id="what-is-image-compression" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-5">What Is Image Compression?</h2>
            <div className="prose prose-lg prose-invert max-w-none text-gray-300">
              <p>
                Image compression is the process of reducing an image file's size by eliminating redundant or less perceptible data. The
                goal is a smaller file that retains as much visual quality as possible — often indistinguishable from the original for
                everyday web and print use.
              </p>
              <p className="mt-4">There are two main types of image compression:</p>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-900/60 border border-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-gray-100 mb-2">Lossy Compression</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Permanently removes some image data to achieve smaller file sizes. Used by JPEG and WebP. Best for photographs where minor
                  quality reduction at extreme ratios is acceptable.
                </p>
              </div>
              <div className="p-5 bg-gray-900/60 border border-gray-700/50 rounded-lg">
                <h3 className="font-semibold text-gray-100 mb-2">Lossless Compression</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Reduces file size without any loss of quality by encoding data more efficiently. Used by PNG and GIF. Best for logos,
                  icons, and graphics with text or sharp edges.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 2: Why It Matters ── */}
          <section id="why-it-matters" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-5">Why Image Compression Matters</h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              Images account for more than 50% of the average web page's total weight. Unoptimized images are among the biggest culprits
              behind slow websites, inflated hosting costs, and poor user experiences. Here's why compression should be part of every web
              workflow:
            </p>

            <div className="space-y-4">
              {reasons.map(({ number, title, desc, colorClass, numberClass }) => (
                <div key={number} className={`flex gap-4 p-4 border rounded-lg ${colorClass}`}>
                  <span className={`font-mono font-bold text-lg shrink-0 ${numberClass}`}>{number}</span>
                  <div>
                    <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 3: How Much Can You Save ── */}
          <section id="how-much-can-you-save" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-5">How Much Can You Actually Save?</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              The savings from image compression are often dramatic. Here's what typical compression looks like across different image
              formats when using a modern compressor:
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-700/50">
              <table className="w-full text-sm">
                <thead className="bg-gray-900/60">
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Format</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Original Size</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Compressed Size</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {compressionStats.map((row) => (
                    <tr key={row.format} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 px-4 text-gray-200 font-medium">{row.format}</td>
                      <td className="py-3 px-4 text-gray-400">{row.original}</td>
                      <td className="py-3 px-4 text-gray-400">{row.compressed}</td>
                      <td className="py-3 px-4 text-emerald-400 font-semibold">{row.savings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              * Estimates based on typical scenarios. Results vary depending on image content, original quality, and chosen compression
              settings.
            </p>
          </section>

          {/* ── Section 4: Formats Explained ── */}
          <section id="formats-explained" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-5">Image Formats Explained</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Choosing the right format is just as important as the compression settings. Here's a quick reference guide to help you decide:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {formatCards.map(({ format, best, pro, con }) => (
                <div key={format} className="p-5 bg-gray-900/50 border border-gray-700/50 rounded-lg">
                  <h3 className="font-bold text-gray-100 text-sm uppercase tracking-wider mb-3">{format}</h3>
                  <p className="text-xs text-blue-400 mb-2">
                    <span className="font-medium">Best for:</span> {best}
                  </p>
                  <p className="text-xs text-emerald-400 mb-1.5">✓ {pro}</p>
                  <p className="text-xs text-red-400">✗ {con}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section 5: Step-by-Step ── */}
          <section id="step-by-step" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-5">How to Compress Images with SnapBit Tools — Step by Step</h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              SnapBit Tools' free image compressor makes it easy to reduce image file sizes in seconds — no account required, no software to
              install, and no files ever leave your device.
            </p>

            <div className="space-y-4">
              {steps.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex gap-4 p-5 bg-gray-900/40 border border-gray-700/40 rounded-lg hover:border-blue-500/30 hover:bg-gray-900/60 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/image-compressor"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 group"
              >
                Open Image Compressor — It's Free
                <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </section>

          {/* ── Section 6: Privacy ── */}
          <section id="privacy-matters" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-5">Privacy First: Why No-Upload Tools Are Better</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Most online image compressors work by uploading your images to a remote server, processing them there, and returning the
              result. This raises serious privacy concerns — especially for sensitive images like personal photos, legal documents, or
              proprietary product assets.
            </p>

            <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-lg mb-6">
              <h3 className="font-semibold text-emerald-300 mb-4">SnapBit Tools is Different</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {[
                  "Your images are processed entirely in your browser using JavaScript — no server involved",
                  "No files are ever uploaded to any external server",
                  "Works offline — no internet connection needed after the page loads",
                  "Zero data retention — close the tab and everything is gone",
                  "No account, no sign-up, and no tracking of your images whatsoever",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-gray-300 leading-relaxed">
              This client-side approach isn't just more private — it's also faster, since there's no waiting for file uploads or server
              processing. Your compression happens at the speed of your own device.
            </p>
          </section>

          {/* ── FAQ Section ── */}
          <section id="faqs" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-gray-900/40 border border-gray-700/50 rounded-lg p-6 cursor-pointer hover:border-blue-500/50 hover:bg-gray-900/60 transition-all duration-200"
                >
                  <summary className="font-semibold text-base flex items-center justify-between text-gray-100 cursor-pointer list-none">
                    {faq.question}
                    <IconChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-300 shrink-0 ml-3" />
                  </summary>
                  <p className="mt-4 text-gray-300 leading-relaxed text-sm">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section>
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-900/30 to-gray-900/50 border border-blue-500/30 rounded-lg text-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-3">Ready to Compress Your Images?</h2>
              <p className="text-gray-400 mb-4 text-md max-w-md mx-auto leading-relaxed">
                Try SnapBit Tools' free, private, browser-based image compressor. No sign-up, no uploads, no limits — just fast, instant
                compression right in your browser.
              </p>
              <Link
                to="/image-compressor"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 group"
              >
                Compress Images Now — Free
                <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </section>
        </article>

        {/* Related Tools */}
        <div className="mt-20">
          <RelatedTools currentToolSlug="image-compressor" category="Images" maxTools={4} />
        </div>
      </div>
    </div>
  );
}
