import { createFileRoute, Link } from "@tanstack/react-router";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

import RelatedTools from "@/components/RelatedTools";
import { getSeoMetadata } from "@/lib/seo";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const PUBLISHED_DATE = "2026-11-18";
const MODIFIED_DATE = "2026-11-18";
const SITE = "https://snapbittools.com";
const PATH = "/pdf-to-jpg-without-upload";
const TITLE = "PDF to JPG Without Upload: Convert Pages Privately in Your Browser (2026)";

const linkClass = "text-brand-primary hover:text-brand-hover hover:underline";

const faqs = [
  {
    question: "Is my PDF uploaded when I convert it to JPG?",
    answer:
      "No. SnapBit’s PDF to JPG tool reads the file in your browser, renders each page on your device, and builds the images there. The PDF is never sent to a server, and SnapBit never receives a copy.",
  },
  {
    question: "Is it safe to convert confidential PDFs this way?",
    answer:
      "It is the safer option, because the document does not leave your computer or phone. There is no account, no cloud storage, and no copy waiting on someone else’s server to be deleted later. The usual care still applies to the images you download and where you share them.",
  },
  {
    question: "Is there a page limit or file size limit?",
    answer:
      "There is no fixed page limit, no watermark, and no daily quota. Every page is converted in one pass. The practical limit is your device’s memory: a very long PDF at 300 DPI takes longer and uses more RAM than a short one at 150 DPI. Very large pages are also scaled down so no side is wider than 4096 pixels, which keeps the tab stable.",
  },
  {
    question: "Should I choose JPG or PNG?",
    answer:
      "Choose JPG for scans, photos, and anything you are sharing or posting, because the files are smaller. Choose PNG for pages full of small text, charts, or line art, because it is lossless and keeps edges crisp, at a larger file size.",
  },
  {
    question: "Does it work on iPhone and Android?",
    answer:
      "Yes. The tool runs in modern mobile browsers such as Safari and Chrome. Pick a PDF from Files or your downloads and convert it there. Long documents at high DPI will be slower on a phone than on a laptop, so start with the Screen preset.",
  },
  {
    question: "Does PDF to JPG work offline?",
    answer:
      "The conversion itself happens on your device, so your file never needs the network. You do need to load the page while online first. SnapBit is a website, not an installed app, and it does not offer a dedicated offline mode.",
  },
  {
    question: "Why can’t I select the text in the JPG?",
    answer:
      "A JPG is a picture of the page. The text becomes pixels. If you need text you can copy or search, keep the original PDF alongside the images.",
  },
  {
    question: "Can I convert a password-protected PDF?",
    answer:
      "Not directly. The tool will tell you the PDF is password-protected. Remove the password in the app that created the file, then convert it.",
  },
];

const tocItems: [string, string][] = [
  ["#why-no-upload", "Why convert PDF to JPG without uploading?"],
  ["#how-to", "How to convert PDF to JPG privately, step by step"],
  ["#jpg-vs-png", "PDF to JPG vs PDF to PNG"],
  ["#use-cases", "Common use cases"],
  ["#limitations", "Limitations of browser-based conversion"],
  ["#related-tools", "Related free PDF tools"],
  ["#faqs", "Frequently asked questions"],
];

const reasons = [
  {
    title: "Privacy",
    desc: "The PDF is read by your browser and never sent to a server. Contracts, IDs, medical forms, and client work stay on your device.",
  },
  {
    title: "Speed",
    desc: "No upload bar, no queue, no download link to wait for. A short PDF converts in seconds, because the only trip your file takes is from disk to tab.",
  },
  {
    title: "No account needed",
    desc: "No signup, no email, no free-trial limit. Open the page and convert. There is no watermark on the images.",
  },
  {
    title: "Works without sending data",
    desc: "Once the page has loaded, the conversion runs locally. A slow or metered connection does not slow it down, because your file is not going anywhere.",
  },
];

const steps = [
  {
    step: "1",
    title: "Open the PDF to JPG tool",
    desc: "Go to snapbittools.com/pdf-to-jpg. Nothing to install and no account to create.",
  },
  {
    step: "2",
    title: "Add your PDF",
    desc: "Drag the file onto the drop area or click Select PDF. The file is opened in your browser, not uploaded. You will see its name and size.",
  },
  {
    step: "3",
    title: "Pick JPG or PNG",
    desc: "JPG is the default and gives smaller files. Switch to PNG for lossless output when the pages are mostly text or diagrams.",
  },
  {
    step: "4",
    title: "Choose a resolution",
    desc: "Web (72 DPI) for email and chat, Screen (150 DPI, the default) for most uses, or Print (300 DPI) for the most detail. You can also fine-tune DPI with the slider.",
  },
  {
    step: "5",
    title: "Set JPEG quality (JPG only)",
    desc: "The slider runs from 40% to 95% and starts at 85%. Lower it for smaller files; raise it when the pages need to look sharp.",
  },
  {
    step: "6",
    title: "Convert and download",
    desc: "Click Convert. A progress bar counts through the pages, then each page appears as a preview with its pixel size and file size. Download single pages, or the whole set as one ZIP.",
  },
];

const comparison = [
  ["Compression", "Lossy: some detail is discarded", "Lossless: every pixel is kept"],
  ["File size", "Smaller", "Larger, often several times larger"],
  ["Best for", "Scans, photos, slides, sharing", "Small text, charts, diagrams, line art"],
  ["Text edges", "Can show slight blur at low quality", "Crisp"],
  ["Quality control", "JPEG quality slider (40–95%)", "None needed"],
  ["Compatibility", "Opens everywhere", "Opens everywhere"],
];

const useCases = [
  {
    title: "Presentations",
    desc: "Drop a page from a report, a chart, or a signed sheet straight onto a slide in PowerPoint, Keynote, or Google Slides as an image.",
  },
  {
    title: "Social media",
    desc: "Platforms like Instagram and LinkedIn accept images, not PDFs. Convert a flyer, menu, or one-page announcement and post it.",
  },
  {
    title: "Previews and thumbnails",
    desc: "Show the first page of an ebook, report, or brochure on a website or in a listing without making people open the PDF.",
  },
  {
    title: "Content creation",
    desc: "Pull a page into a blog post, newsletter, or design file where only images are supported.",
  },
  {
    title: "Messaging and forms",
    desc: "Some chat apps preview images better than PDFs, and some upload forms only accept JPG. A 72 or 150 DPI JPG is usually small enough for both.",
  },
  {
    title: "Annotating a page",
    desc: "Once a page is an image, you can mark it up in any photo editor or screenshot tool.",
  },
];

const limitations = [
  {
    title: "Very large or very long PDFs",
    desc: "Your own device does the work. A 300-page scan at 300 DPI can be slow on an older laptop or phone. Use a lower DPI, or split the PDF first and convert only the pages you need.",
  },
  {
    title: "You need selectable or editable text",
    desc: "JPG and PNG are pictures. If someone needs to search, copy, or edit the text, send the PDF instead, or alongside the images.",
  },
  {
    title: "Password-protected files",
    desc: "Encrypted PDFs are not opened. Remove the password in the original app first.",
  },
  {
    title: "Huge page sizes",
    desc: "Pages are capped at 4096 pixels on the longest side to keep the browser stable. Posters and large-format drawings at 300 DPI will be scaled down to fit.",
  },
  {
    title: "No page selection inside the converter",
    desc: "Every page is converted. To export only a few, split the PDF first, then convert the part you want.",
  },
];

export const Route = createFileRoute("/_wrap/pdf-to-jpg-without-upload")({
  head: () =>
    getSeoMetadata({
      title: TITLE,
      description:
        "Convert PDF to JPG without uploading. A private, browser-based method to turn PDF pages into JPG or PNG images, with no account, no watermark, and no server.",
      keywords: [
        "pdf to jpg without upload",
        "convert pdf to jpg privately",
        "pdf to jpg in browser",
        "pdf to jpg no upload",
        "private pdf to jpg converter",
        "pdf to jpg offline",
        "pdf to png without upload",
        "convert pdf pages to images",
        "pdf to jpg no signup",
        "pdf to jpg free no watermark",
        "pdf to jpg iphone",
        "snapbittools pdf to jpg",
      ],
      url: PATH,
      type: "website",
      faqs,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blogs", path: "/blogs" },
        { name: "PDF to JPG Without Upload", path: PATH },
      ],
      schema: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: TITLE,
        description:
          "How to convert PDF pages to JPG or PNG in the browser without uploading the file, with settings, a JPG vs PNG comparison, use cases, and limits.",
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
        keywords: "pdf to jpg without upload, convert pdf to jpg privately, pdf to jpg in browser, pdf to png without upload",
        articleSection: "PDF Tools",
        inLanguage: "en-US",
        about: {
          "@type": "Thing",
          name: "PDF to JPG conversion",
          description: "Converting PDF pages to JPG or PNG images in the browser without uploading the file",
        },
      },
    }),
  component: BlogPage,
});

function StepList({ items }: { items: { step: string; title: string; desc: string }[] }) {
  return (
    <div className="space-y-4">
      {items.map(({ step, title, desc }) => (
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
  );
}

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
              November 18, 2026
            </time>
            <span className="text-theme-body">·</span>
            <span className="text-theme-muted text-xs">8 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-heading leading-tight mb-6">
            PDF to JPG Without Upload: Convert Pages Privately in Your Browser (2026)
          </h1>

          <p className="text-lg text-theme-muted leading-relaxed">
            You need one page of a PDF as an image. Maybe it is a slide for a deck, a flyer for Instagram, or a signed form a portal will
            only take as a JPG. Most converters solve that by taking your whole document first. This guide shows how to{" "}
            <strong className="text-theme-heading font-medium">convert PDF to JPG without uploading</strong> anything.
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
            Short on time? Open the converter, drop in a PDF, and download JPGs. The file never leaves your device.
          </p>
          <Link to="/pdf-to-jpg" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-4 py-2.5 shrink-0")}>
            Convert PDF to JPG
            <IconChevronRight className="w-4 h-4" />
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
          <section className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">The problem with most PDF to JPG converters</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              Search for “PDF to JPG” and nearly every result works the same way. You upload the PDF. Their server renders the pages. You
              wait, then download a ZIP from their site.
            </p>
            <p className="text-theme-body leading-relaxed mb-4">
              That is fine for a restaurant menu. It is not fine for a bank statement, a contract, a passport scan, or a client’s
              unreleased pitch deck. Once the file is uploaded, you are trusting a stranger’s retention policy, their security, and
              whatever “deleted after one hour” really means.
            </p>
            <p className="text-theme-body leading-relaxed">
              There is a simpler way. Modern browsers can open and render PDFs on their own. A browser-based converter uses that ability
              to draw each page and save it as an image, right in the tab. No server ever sees the document. That is how the{" "}
              <Link to="/pdf-to-jpg" className={linkClass}>
                SnapBit PDF to JPG converter
              </Link>{" "}
              works.
            </p>
          </section>

          <section id="why-no-upload" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Why convert PDF to JPG without uploading?</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              “No upload” is not just a privacy feature. It changes how the whole job feels.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {reasons.map(({ title, desc }) => (
                <div key={title} className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                  <h3 className="font-semibold text-theme-heading mb-2">{title}</h3>
                  <p className="text-sm text-theme-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-theme-body leading-relaxed mb-4">
              A note on “offline,” because it gets used loosely. SnapBit is a website, not an installed app. You load the page while
              online, the same as any site. After that, your PDF is processed entirely on your device. Nothing about your file travels over
              the network.
            </p>
            <p className="text-theme-body leading-relaxed">
              A quick way to tell the difference on any site: a true browser-based tool never shows an “Uploading…” bar. The progress you
              see is your own device counting through the pages.
            </p>
          </section>

          <section id="how-to" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">
              How to convert PDF to JPG privately, step by step
            </h2>
            <p className="text-theme-body leading-relaxed mb-8">
              This uses{" "}
              <Link to="/pdf-to-jpg" className={linkClass}>
                SnapBit Tools’ PDF to JPG
              </Link>
              . It is free, works in Chrome, Edge, Firefox, and Safari, and takes about a minute the first time.
            </p>
            <div className="mb-8">
              <StepList items={steps} />
            </div>
            <p className="text-theme-body leading-relaxed mb-4">
              The downloaded files are named after your PDF, so <code className="text-sm">report.pdf</code> becomes{" "}
              <code className="text-sm">report-page-1.jpg</code>, <code className="text-sm">report-page-2.jpg</code>, and so on, inside{" "}
              <code className="text-sm">report-pages.zip</code>. A one-page PDF downloads as a single image instead of a ZIP.
            </p>
            <div className="p-5 bg-theme-surface border border-theme-border rounded-lg mb-8">
              <h3 className="font-semibold text-theme-heading mb-2">Which settings should you start with?</h3>
              <ul className="space-y-2 text-sm text-theme-muted leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-theme-heading font-medium">Sharing in chat or email:</strong> JPG, Web (72 DPI), 75–85% quality.
                </li>
                <li>
                  <strong className="text-theme-heading font-medium">Slides, websites, social posts:</strong> JPG, Screen (150 DPI), 85%
                  quality.
                </li>
                <li>
                  <strong className="text-theme-heading font-medium">Printing or zooming in:</strong> Print (300 DPI), JPG at 90–95%, or
                  PNG.
                </li>
                <li>
                  <strong className="text-theme-heading font-medium">Text-heavy pages and diagrams:</strong> PNG at 150 DPI.
                </li>
              </ul>
            </div>
            <p className="text-theme-body leading-relaxed mb-6">
              Changed your mind about a setting after converting? Adjust it and click Convert again. The previous results are cleared so
              you never mix two sets of images.
            </p>
            <Link to="/pdf-to-jpg" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-3 group")}>
              Open PDF to JPG
              <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </section>

          <section id="jpg-vs-png" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">PDF to JPG vs PDF to PNG</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              Both formats come out of the same tool. The right one depends on what is on the page and where the image is going.
            </p>
            <div className="overflow-x-auto rounded-lg border border-theme-border mb-6">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-theme-surface">
                  <tr className="border-b border-theme-border">
                    {["", "JPG", "PNG"].map((heading) => (
                      <th key={heading} className="text-left py-3 px-3 text-theme-muted font-medium text-xs uppercase tracking-wide">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {comparison.map(([label, jpg, png]) => (
                    <tr key={label}>
                      <td className="py-3 px-3 text-theme-heading font-medium text-xs">{label}</td>
                      <td className="py-3 px-3 text-theme-body text-xs">{jpg}</td>
                      <td className="py-3 px-3 text-theme-body text-xs">{png}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-theme-body leading-relaxed">
              Rule of thumb: if the page looks like a photo or a scan, use JPG. If it looks like a spreadsheet, a slide full of small
              type, or a technical drawing, use PNG. JPG and JPEG are the same format; only the extension differs.
            </p>
          </section>

          <section id="use-cases" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Common use cases</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              Most people convert PDF pages to images because the place they are sending them does not accept PDFs, or shows them badly.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {useCases.map(({ title, desc }) => (
                <div key={title} className="p-5 bg-theme-surface border border-theme-border rounded-lg">
                  <h3 className="font-semibold text-theme-heading mb-2">{title}</h3>
                  <p className="text-sm text-theme-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="limitations" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Limitations of browser-based conversion</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              Doing the work on your device is the point, but it comes with a few honest trade-offs.
            </p>
            <div className="space-y-3">
              {limitations.map(({ title, desc }) => (
                <div key={title} className="p-5 border border-theme-border rounded-lg bg-theme-surface">
                  <h3 className="font-semibold text-theme-heading text-sm mb-1.5">{title}</h3>
                  <p className="text-sm text-theme-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="related-tools" className="scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Related free PDF tools</h2>
            <p className="text-theme-body leading-relaxed mb-6">
              PDF to JPG is often one step in a bigger job. These tools work the same way: in the browser, free, with no upload.
            </p>
            <ul className="space-y-4 text-theme-body leading-relaxed mb-6">
              <li>
                <Link to="/pdf-to-jpg" className={cn(linkClass, "font-medium")}>
                  PDF to JPG
                </Link>{" "}
                turns every page into a JPG or PNG, with DPI and quality controls.
              </li>
              <li>
                <Link to="/split-pdf" className={cn(linkClass, "font-medium")}>
                  Split PDF
                </Link>{" "}
                saves each page as its own PDF or cuts the file in two. Use it first when you only want a few pages as images.
              </li>
              <li>
                <Link to="/merge-pdf" className={cn(linkClass, "font-medium")}>
                  Merge PDF
                </Link>{" "}
                combines several PDFs into one, so you can convert a whole packet in a single pass.
              </li>
              <li>
                <Link to="/pdf-compressor" className={cn(linkClass, "font-medium")}>
                  PDF Compressor
                </Link>{" "}
                shrinks a PDF for email when you need to keep it as a PDF rather than images.
              </li>
            </ul>
            <p className="text-theme-body leading-relaxed">
              For the full private workflow, including the order to use these in, read{" "}
              <Link to="/free-pdf-tools-offline-merge-split-compress" className={linkClass}>
                Free PDF Tools That Work Offline: Merge, Split &amp; Compress Without Upload
              </Link>
              .
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
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-heading mb-5">Conclusion</h2>
            <p className="text-theme-body leading-relaxed mb-4">
              Turning a PDF page into an image should not mean handing the whole document to a server. A browser-based converter does
              the same job on your own device: pick JPG or PNG, choose a resolution, and download the pages one by one or as a ZIP.
            </p>
            <p className="text-theme-body leading-relaxed mb-8">
              It is free, needs no account, adds no watermark, and works on desktop and mobile. Your file stays yours.
            </p>
            <div className="p-6 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-center">
              <h2 className="text-lg sm:text-xl font-bold text-theme-heading mb-3">Convert PDF to JPG without uploading it</h2>
              <p className="text-theme-muted mb-5 text-sm max-w-lg mx-auto leading-relaxed">
                Drop in a PDF and get JPG or PNG pages in seconds, all inside your browser.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/pdf-to-jpg" className={cn(tc.btnPrimary, "inline-flex items-center gap-2 font-semibold px-6 py-3")}>
                  Try PDF to JPG
                </Link>
                <Link to="/pdf-tools" className={cn(tc.btnSecondary, "inline-flex items-center gap-2 font-semibold px-6 py-3")}>
                  All PDF tools
                </Link>
              </div>
            </div>
          </section>
        </article>

        <div className="mt-20">
          <RelatedTools currentToolSlug="pdf-to-jpg" category="PDF" maxTools={6} />
        </div>
      </div>
    </div>
  );
}
