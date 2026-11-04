import { createFileRoute, Link } from "@tanstack/react-router";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

import RelatedTools from "@/components/RelatedTools";
import { getSeoMetadata } from "@/lib/seo";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const PUBLISHED_DATE = "2026-11-04";
const MODIFIED_DATE = "2026-11-04";
const SITE = "https://snapbittools.com";
const PATH = "/free-pdf-tools-offline-merge-split-compress";

const faqs = [
  {
    question: "Are there free PDF tools that work offline without an upload?",
    answer:
      "Yes. SnapBit’s merge, split, reorder, compress, PDF to JPG, image to PDF, and PDF image extractor all run in the browser. The file stays on your device. You do not create an account, and the PDF is not sent to a server.",
  },
  {
    question: "How do I merge PDF files without uploading them?",
    answer:
      "Open Merge PDF, add the documents, drag them into the order you want, and download one combined PDF. Pages are copied, so selectable text stays selectable. Password-protected PDFs are not supported.",
  },
  {
    question: "How do I split a PDF offline and keep real text?",
    answer:
      "Use Split PDF. You can download a ZIP with one PDF per page, or cut the file into two PDFs after a page you choose. Each result is a copy of the original pages, not a screenshot.",
  },
  {
    question: "Will compressing a PDF remove selectable text?",
    answer:
      "On SnapBit’s PDF Compressor, yes. Private compression redraws each page as a JPEG and rebuilds the PDF, which is why the file gets smaller. Use it when size matters more than copy-paste. Use Merge PDF or Split PDF when you need the original text layer.",
  },
  {
    question: "What PDF compressor settings should I start with?",
    answer:
      "Balanced is the default: about 100 DPI and 72% JPEG quality. Choose Strong (72 DPI, 55% quality) for email. Choose High quality (144 DPI, 85% quality) for scans and screenshots you still need to read closely.",
  },
  {
    question: "Why did my compressed PDF not get smaller?",
    answer:
      "Some files are already optimized. If the new PDF would be larger than the original, SnapBit keeps the original and tells you. Try the Strong preset on image-heavy files, or leave an already-small text PDF alone.",
  },
  {
    question: "Can I reorder or delete PDF pages without uploading?",
    answer:
      "Yes. Reorder PDF lets you drag pages into a new sequence and remove pages you do not want, then download the file. Processing stays in the browser.",
  },
  {
    question: "How do I turn PDF pages into JPG without an upload?",
    answer:
      "Open PDF to JPG and export pages as JPG or PNG. If you only need the photographs that are already inside a PDF, use the PDF Image Extractor and download them as a ZIP.",
  },
];

const tocItems: [string, string][] = [
  ["#why-offline-pdf-tools", "Why offline PDF tools matter"],
  ["#what-offline-means", "What “works offline” means in the browser"],
  ["#merge-pdf", "Merge PDF files without an upload"],
  ["#split-pdf", "Split a PDF and extract pages"],
  ["#compress-pdf", "Compress a PDF without uploading it"],
  ["#which-tool", "Merge, split, or compress: which job is which"],
  ["#full-workflow", "A private PDF workflow from start to finish"],
  ["#limits", "Limits worth knowing before you start"],
  ["#faqs", "Frequently asked questions"],
];

const mergeSteps = [
  {
    step: "1",
    title: "Open Merge PDF",
    desc: "Go to the Merge PDF tool. Nothing is installed, and the documents are not uploaded.",
  },
  {
    step: "2",
    title: "Add every file that belongs in the packet",
    desc: "Add the cover letter, the report, and the appendix as separate PDFs. The tool copies pages; it does not photograph them.",
  },
  {
    step: "3",
    title: "Drag the files into reading order",
    desc: "The first file in the list becomes the start of the new PDF. Check the order before you merge.",
  },
  {
    step: "4",
    title: "Download one combined PDF",
    desc: "Selectable text, images, and the original page size stay in the merged file. Save it locally.",
  },
];

const splitSteps = [
  {
    step: "1",
    title: "Open Split PDF",
    desc: "Use Split PDF when one document needs to become several files, still without an upload.",
  },
  {
    step: "2",
    title: "Choose every page, or a cut into two",
    desc: "Every page downloads a ZIP with one PDF per page. A two-part split downloads a ZIP with part 1 and part 2.",
  },
  {
    step: "3",
    title: "Pick the break page if you are cutting in two",
    desc: "The pages before the break stay in the first file. The rest go in the second. Text remains selectable because the pages are copied.",
  },
  {
    step: "4",
    title: "Unzip and keep only what you need",
    desc: "Rename the pieces for the recipient. Discard pages that should never have left the original packet.",
  },
];

const compressSteps = [
  {
    step: "1",
    title: "Open PDF Compressor",
    desc: "Use this when the file is too large to email or upload to a form, and a smaller copy is more important than selectable text.",
  },
  {
    step: "2",
    title: "Start on Balanced",
    desc: "Balanced uses about 100 DPI and 72% JPEG quality. That is the right first pass for most mixed documents.",
  },
  {
    step: "3",
    title: "Move to Strong or High quality only if the preview asks for it",
    desc: "Strong (72 DPI, 55% quality) is for sharing. High quality (144 DPI, 85% quality) keeps scans and screenshots easier to read.",
  },
  {
    step: "4",
    title: "Download the smaller PDF, or keep the original",
    desc: "If compression would make the file larger, SnapBit keeps the original and says it was already optimized.",
  },
];

const toolChoice = [
  {
    job: "Combine several PDFs into one",
    tool: "Merge PDF",
    href: "/merge-pdf" as const,
    keep: "Selectable text stays",
  },
  {
    job: "Save each page, or cut a PDF in two",
    tool: "Split PDF",
    href: "/split-pdf" as const,
    keep: "Selectable text stays",
  },
  {
    job: "Change page order or drop pages",
    tool: "Reorder PDF",
    href: "/reorder-pdf" as const,
    keep: "Selectable text stays",
  },
  {
    job: "Shrink a PDF for email",
    tool: "PDF Compressor",
    href: "/pdf-compressor" as const,
    keep: "Pages become images",
  },
  {
    job: "Turn pages into JPG or PNG",
    tool: "PDF to JPG",
    href: "/pdf-to-jpg" as const,
    keep: "One image per page",
  },
  {
    job: "Pull photos out of a PDF",
    tool: "PDF Image Extractor",
    href: "/pdf-extract-images" as const,
    keep: "Pictures in a ZIP",
  },
  {
    job: "Build a PDF from images",
    tool: "Image to PDF",
    href: "/image-to-pdf" as const,
    keep: "Images become pages",
  },
];

const limits = [
  {
    title: "Password-protected PDFs",
    fix: "Merge PDF and Split PDF do not open files that ask for a password. Remove the password in the app that created the file, then use the browser tools.",
  },
  {
    title: "Expecting a compressed PDF to stay editable",
    fix: "Compression redraws pages so the file gets smaller. Copy, search, and form fields in that copy will not behave like the original. Merge, split, and reorder when you still need real text.",
  },
  {
    title: "Compressing a PDF that is already small",
    fix: "A text-only PDF that is already a few hundred kilobytes often will not shrink. The tool keeps the original when the new file would be larger.",
  },
  {
    title: "Sending the whole packet when only two pages were requested",
    fix: "Split or reorder first, then compress only the pages you are allowed to share.",
  },
];

export const Route = createFileRoute("/_wrap/free-pdf-tools-offline-merge-split-compress")({
  head: () =>
    getSeoMetadata({
      title: "Free PDF Tools That Work Offline: Merge, Split & Compress Without Upload",
      description:
        "Merge, split, and compress PDFs in your browser with no upload. Private steps for combining files, extracting pages, and reducing PDF size.",
      keywords: [
        "free pdf tools that work offline",
        "merge pdf without upload",
        "split pdf offline",
        "compress pdf without uploading",
        "merge split compress pdf",
        "reduce pdf file size no upload",
        "combine pdf files free",
        "extract pdf pages privately",
        "reorder pdf pages",
        "pdf to jpg no upload",
        "image to pdf offline",
        "private pdf tools",
        "browser pdf tools",
        "snapbittools pdf",
      ],
      url: PATH,
      type: "website",
      faqs,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blogs", path: "/blogs" },
        { name: "Free PDF Tools That Work Offline", path: PATH },
      ],
      schema: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "Free PDF Tools That Work Offline: Merge, Split & Compress Without Upload",
        description:
          "How to merge, split, reorder, and compress PDFs in the browser without uploading the file, including when compression removes selectable text.",
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
          logo: { "@type": "ImageObject", url: `${SITE}/logo512.png` },
        },
        image: `${SITE}/og.png`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE}${PATH}`,
        },
        keywords:
          "free pdf tools that work offline, merge pdf without upload, split pdf offline, compress pdf without uploading",
        articleSection: "PDF Tools",
        inLanguage: "en-US",
        about: {
          "@type": "Thing",
          name: "Offline PDF tools",
          description: "Browser tools that merge, split, and compress PDFs without uploading the file",
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
              PDF Tools
            </span>
            <span className="text-theme-body">·</span>
            <time dateTime={PUBLISHED_DATE} className="text-theme-muted text-xs">
              November 4, 2026
            </time>
            <span className="text-theme-body">·</span>
            <span className="text-theme-muted text-xs">14 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-heading leading-tight mb-6">
            Free PDF Tools That Work Offline: Merge, Split &amp; Compress Without Upload
          </h1>

          <p className="text-lg text-theme-muted leading-relaxed">
            A contract, a scan, and a slide deck should not have to leave your computer just to become one file. This guide shows how to{" "}
            <strong className="text-theme-heading font-medium">merge, split, and compress PDFs without an upload</strong>, using the free
            tools on{" "}
            <Link to="/pdf-tools" className="text-brand-primary hover:text-brand-hover hover:underline">
              SnapBit PDF tools
            </Link>
            . Every step runs in the browser.
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
          <p className="text-sm text-theme-body leading-relaxed">
            Start with the three jobs people do most: merge, split, and compress. All three stay on your device.
          </p>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/merge-pdf" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-4 py-2.5")}>
              Merge PDF
            </Link>
            <Link to="/split-pdf" className={cn(tc.btnSecondary, "inline-flex items-center gap-2 font-semibold px-4 py-2.5")}>
              Split PDF
            </Link>
            <Link to="/pdf-compressor" className={cn(tc.btnSecondary, "inline-flex items-center gap-2 font-semibold px-4 py-2.5")}>
              Compress PDF
            </Link>
          </div>
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
          <section id="why-offline-pdf-tools" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Why offline PDF tools matter</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              PDFs carry the documents people are least willing to hand to a stranger: signed agreements, medical notes, invoices, school
              records, and unpublished drafts. A typical “free PDF” site still asks you to upload that file, wait in a queue, and download a
              result from their server. The page is free. The copy of your document is the price.
            </p>
            <p className="text-theme-body leading-relaxed mb-4">
              Offline tools avoid that trade. You open a page, the work happens in the tab, and the finished file downloads straight back to
              your disk. There is no account to create and no archive of your paperwork sitting on someone else’s machine.
            </p>
            <p className="text-theme-body leading-relaxed">
              That is the standard for the tools in this guide. If you only need one place to start, the{" "}
              <Link to="/pdf-tools" className="text-brand-primary hover:text-brand-hover hover:underline">
                PDF tools
              </Link>{" "}
              list has merge, split, reorder, compress, PDF to image, and image to PDF, all built the same way: free PDF tools that work
              offline, in the browser, without an upload.
            </p>
          </section>

          <section id="what-offline-means" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">What “works offline” means in the browser</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              “Offline” here means the PDF never leaves the device. You still load the tool page once, the same way you load any website.
              After that, the file you drop into the page is read by your browser. Merging copies pages locally. Splitting writes new PDFs
              locally. Compression redraws pages locally. The download is a file your browser created, not a link emailed back from a server.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">What stays on your computer</h3>
                <p className="text-sm text-theme-muted leading-relaxed">
                  The PDF itself, the page order you choose, and the file you download. SnapBit does not receive the document.
                </p>
              </div>
              <div className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">What you still need</h3>
                <p className="text-sm text-theme-muted leading-relaxed">
                  A current browser and enough memory for the file you open. A very large scan can feel slow because your own device is
                  doing the work.
                </p>
              </div>
            </div>
            <p className="text-theme-body leading-relaxed">
              If a site asks you to wait while it “uploads 100%,” it is not this kind of tool. The jobs below are the ones you can finish
              when you want a merge, a split, or a smaller PDF without uploading.
            </p>
          </section>

          <section id="merge-pdf" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Merge PDF files without an upload</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              Merging is for the moment a packet is still in pieces: a proposal plus exhibits, a resume plus a portfolio, three scanned
              chapters that should read as one document.{" "}
              <Link to="/merge-pdf" className="text-brand-primary hover:text-brand-hover hover:underline">
                Merge PDF
              </Link>{" "}
              copies the pages from each file, in the order you set, into one new PDF.
            </p>
            <p className="text-theme-body leading-relaxed mb-8">
              Because the pages are copied and not photographed, selectable text stays selectable. Images stay images. Page size stays the
              page size of the source. Drag the files into reading order before you run it. The first file in the list becomes the start of
              the combined PDF.
            </p>
            <div className="space-y-4 mb-8">
              {mergeSteps.map(({ step, title, desc }) => (
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
            <p className="text-theme-body leading-relaxed mb-6">
              Need to drop a blank page or move a signature sheet before you combine anything? Do that first with{" "}
              <Link to="/reorder-pdf" className="text-brand-primary hover:text-brand-hover hover:underline">
                Reorder PDF
              </Link>
              , then merge. If the source material is photos rather than PDFs, build the file with{" "}
              <Link to="/image-to-pdf" className="text-brand-primary hover:text-brand-hover hover:underline">
                Image to PDF
              </Link>{" "}
              and merge that result with the rest of the packet.
            </p>
            <Link to="/merge-pdf" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-3 group")}>
              Open Merge PDF
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </section>

          <section id="split-pdf" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Split a PDF and extract pages</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              Splitting is the opposite job, and it is just as common. Someone asks for “only the signature page,” or you need to send
              chapter 2 without the rest of the report.{" "}
              <Link to="/split-pdf" className="text-brand-primary hover:text-brand-hover hover:underline">
                Split PDF
              </Link>{" "}
              does that on your device in two ways.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">Every page as its own PDF</h3>
                <p className="text-sm text-theme-muted leading-relaxed">
                  You download a ZIP named after the original file. Inside is one PDF per page. Useful when a scanner dumped a whole stack
                  into a single file.
                </p>
              </div>
              <div className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                <h3 className="font-semibold text-theme-heading mb-2">Cut the file into two</h3>
                <p className="text-sm text-theme-muted leading-relaxed">
                  You choose the page where the document should break. The download is a ZIP with part 1 and part 2. Use this when the front
                  matter and the appendix should travel separately.
                </p>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              {splitSteps.map(({ step, title, desc }) => (
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
            <p className="text-theme-body leading-relaxed">
              Both options copy pages, so the text in the new files can still be selected. If you need one page as a picture instead of a
              PDF, switch to{" "}
              <Link to="/pdf-to-jpg" className="text-brand-primary hover:text-brand-hover hover:underline">
                PDF to JPG
              </Link>{" "}
              and export JPG or PNG. If the only thing you want is the photographs already embedded in the file,{" "}
              <Link to="/pdf-extract-images" className="text-brand-primary hover:text-brand-hover hover:underline">
                PDF Image Extractor
              </Link>{" "}
              saves those pictures in a ZIP. That is the private way to split a PDF offline and keep only the pages you meant to share.
            </p>
          </section>

          <section id="compress-pdf" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Compress a PDF without uploading it</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              Mail servers and application forms still reject large PDFs. A 20 MB scan of a form is a common reason people go looking for a
              compressor, and it is also the moment they are most tempted to upload a sensitive file.{" "}
              <Link to="/pdf-compressor" className="text-brand-primary hover:text-brand-hover hover:underline">
                PDF Compressor
              </Link>{" "}
              shrinks the file in the browser. The document is not uploaded.
            </p>
            <p className="text-theme-body leading-relaxed mb-6">
              The method is specific, and it changes what the file can do afterward. Each page is drawn and saved as a JPEG at the quality
              and resolution you pick, then those images are assembled into a new PDF. That is why image-heavy files shrink. It is also why
              text in the compressed copy is no longer selectable. Use compression when a smaller file is the goal. Use merge or split when
              you still need to copy text out of the PDF.
            </p>
            <div className="overflow-x-auto rounded-lg border border-theme-border mb-8">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-theme-surface">
                  <tr className="border-b border-theme-border">
                    {["Preset", "Settings", "Use it for"].map((heading) => (
                      <th key={heading} className="text-left py-3 px-3 text-theme-muted font-medium text-xs uppercase tracking-wide">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  <tr>
                    <td className="py-3 px-3 text-theme-heading font-medium text-xs">Balanced</td>
                    <td className="py-3 px-3 text-theme-body text-xs">About 100 DPI, 72% JPEG quality</td>
                    <td className="py-3 px-3 text-theme-muted text-xs">Most mixed documents. Start here.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-theme-heading font-medium text-xs">Strong</td>
                    <td className="py-3 px-3 text-theme-body text-xs">72 DPI, 55% JPEG quality</td>
                    <td className="py-3 px-3 text-theme-muted text-xs">Email and forms with a strict size limit.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-theme-heading font-medium text-xs">High quality</td>
                    <td className="py-3 px-3 text-theme-body text-xs">144 DPI, 85% JPEG quality</td>
                    <td className="py-3 px-3 text-theme-muted text-xs">Scans and screenshots you still need to read closely.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-4 mb-8">
              {compressSteps.map(({ step, title, desc }) => (
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
            <p className="text-theme-body leading-relaxed mb-6">
              You can also move the JPEG quality and DPI controls yourself after you pick a preset. If the result is larger than the file
              you started with, keep the original. Compressing a PDF without uploading it only helps when the new file is actually smaller.
            </p>
            <Link to="/pdf-compressor" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-3 group")}>
              Open PDF Compressor
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </section>

          <section id="which-tool" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Merge, split, or compress: which job is which</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              People often open a compressor when they needed a split, or merge three files and then discover the text can no longer be
              copied. Match the job first. The tool name is the second column, and each one links to the page that does that job.
            </p>
            <div className="overflow-x-auto rounded-lg border border-theme-border">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-theme-surface">
                  <tr className="border-b border-theme-border">
                    {["You need to", "Open", "What you keep"].map((heading) => (
                      <th key={heading} className="text-left py-3 px-3 text-theme-muted font-medium text-xs uppercase tracking-wide">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {toolChoice.map((row) => (
                    <tr key={row.href} className="hover:bg-theme-surface-muted/20 transition-colors">
                      <td className="py-3 px-3 text-theme-heading font-medium text-xs">{row.job}</td>
                      <td className="py-3 px-3 text-xs">
                        <Link to={row.href} className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                          {row.tool}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-theme-muted text-xs">{row.keep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="full-workflow" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">A private PDF workflow from start to finish</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              A real packet rarely needs only one of these tools. This order keeps the text layer intact until the moment you decide the
              file must get smaller.
            </p>
            <ol className="space-y-4 text-theme-body list-decimal list-inside mb-8">
              <li>
                Turn loose photos into a PDF with{" "}
                <Link to="/image-to-pdf" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  Image to PDF
                </Link>{" "}
                if they are not PDFs yet.
              </li>
              <li>
                Fix page order and delete blanks with{" "}
                <Link to="/reorder-pdf" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  Reorder PDF
                </Link>
                .
              </li>
              <li>
                Combine the pieces with{" "}
                <Link to="/merge-pdf" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  Merge PDF
                </Link>
                .
              </li>
              <li>
                If someone should only receive part of it,{" "}
                <Link to="/split-pdf" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  split the PDF
                </Link>{" "}
                before you send it.
              </li>
              <li>
                Compress the copy you are about to email with the{" "}
                <Link to="/pdf-compressor" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  PDF Compressor
                </Link>
                . Keep the uncompressed original in your own folder.
              </li>
              <li>
                Need a picture of a page, or the photos inside it? Use{" "}
                <Link to="/pdf-to-jpg" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  PDF to JPG
                </Link>{" "}
                or the{" "}
                <Link to="/pdf-extract-images" className="text-brand-primary hover:text-brand-hover hover:underline font-medium">
                  PDF Image Extractor
                </Link>
                .
              </li>
            </ol>
            <div className={cn(tc.diffAdded, "p-6 border border-theme-border rounded-lg")}>
              <h3 className="font-semibold text-[var(--theme-diff-added-text)] mb-3">What you get from doing it in this order</h3>
              <ul className="space-y-2 text-sm text-theme-body">
                {[
                  "The file you keep still has selectable text",
                  "The file you send is only as large as it needs to be",
                  "Nothing in the packet was uploaded to finish the job",
                  "Every step is on the same site, with no account",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[var(--theme-diff-added-text)] shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="limits" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Limits worth knowing before you start</h2>
            <div className="space-y-3">
              {limits.map(({ title, fix }) => (
                <div key={title} className="p-5 border border-theme-border rounded-lg bg-theme-surface">
                  <h3 className="font-semibold text-theme-heading text-sm mb-1.5">{title}</h3>
                  <p className="text-sm text-theme-muted leading-relaxed">{fix}</p>
                </div>
              ))}
            </div>
            <p className="text-theme-body leading-relaxed mt-6">
              Those limits are why the tool list is split the way it is. Merge, split, and reorder are for a PDF you still want to treat as
              a document. Compress, PDF to JPG, and image extraction are for a PDF you are willing to treat as pictures. Picking the right
              one is the whole of a careful offline PDF workflow.
            </p>
          </section>

          <section id="faqs" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-8">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
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
                Merge, split, and compress a PDF without uploading it
              </h2>
              <p className="text-theme-muted mb-5 text-sm max-w-lg mx-auto leading-relaxed">
                The tools are free, they run in the browser, and the file stays on your device. Start with the job you actually have.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/merge-pdf" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-3")}>
                  Merge PDF
                </Link>
                <Link to="/split-pdf" className={cn(tc.btnSecondary, "inline-flex items-center gap-2 font-semibold px-6 py-3")}>
                  Split PDF
                </Link>
                <Link to="/pdf-compressor" className={cn(tc.btnSecondary, "inline-flex items-center gap-2 font-semibold px-6 py-3")}>
                  Compress PDF
                </Link>
              </div>
            </div>
          </section>
        </article>

        <div className="mt-20">
          <RelatedTools currentToolSlug="pdf-compressor" category="PDF" maxTools={6} />
        </div>
      </div>
    </div>
  );
}
