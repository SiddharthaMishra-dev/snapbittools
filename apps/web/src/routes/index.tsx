import type { ReactNode } from "react";

import {
  IconArrowRight,
  IconBolt,
  IconBrandGithub,
  IconCheck,
  IconChevronRight,
  IconLock,
} from "@tabler/icons-react";
import { Link, createFileRoute, createLink } from "@tanstack/react-router";
import { AnimatePresence, easeInOut, motion } from "motion/react";

import { tools } from "@/data/tools";

import PageShell from "@/components/PageShell";
import { getSeoMetadata } from "@/lib/seo";
import React from "react";
import Button from "@/components/ui/button";
import { Button as MagneticButton } from "@/components/Magnetic-button";

const jsonToCsvTool = tools.find((tool) => tool.slug === "json-to-csv");
const featuredTools = [
  ...(jsonToCsvTool ? [jsonToCsvTool] : []),
  ...tools.filter((tool) => tool.slug !== "json-to-csv"),
].slice(0, 6);

export const Route = createFileRoute("/")({
  head: () =>
    getSeoMetadata({
      title: "SnapBit Tools | Private & Fast Image and Data Tools",
      description:
        "Private browser tools: Convert images to Base64, compress photos, format JSON, and convert CSV to Excel. 100% secure—your data never leaves your browser.",
      keywords: [
        "free online tools",
        "image to base64 converter",
        "image compressor online",
        "image format converter",
        "json formatter validator",
        "csv to xlsx converter",
        "image to pdf converter",
        "json to csv converter",
        "privacy-first tools",
        "client-side processing",
        "offline image tools",
        "free developer tools",
        "browser-based utilities",
        "no upload file converter",
        "secure online tools",
      ],
      url: "/",
    }),
  component: App,
});

function App() {
  const ButtonLink = createLink(Button);
  const rotatingWords = ["Free", "Private", "Fast"];
  const widthSafetyBuffer = 15;
  const wordMeasureRefs = React.useRef<Array<HTMLSpanElement | null>>([]);

  const [active, setActive] = React.useState(0);
  const [wordWidth, setWordWidth] = React.useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15, duration: 0.5, ease: easeInOut },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeInOut } },
  };

  React.useEffect(() => {
    const interval = setInterval(() => setActive((p) => (p + 1) % 3), 4000);
    return () => clearInterval(interval);
  }, []);

  React.useLayoutEffect(() => {
    const el = wordMeasureRefs.current[active];
    if (el) setWordWidth(el.offsetWidth);
  }, [active]);

  React.useEffect(() => {
    const onResize = () => {
      const el = wordMeasureRefs.current[active];
      if (el) setWordWidth(el.offsetWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  return (
    <PageShell withDotGrid={false} className="bg-theme-page">
      <div className="theme-dot-grid pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section className="relative z-10 pt-28 pb-0 px-4 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-6 flex flex-col items-center"
        >
          {/* Open-source pill */}
          <motion.a
            variants={itemVariants}
            href="https://github.com/SiddharthaMishra-dev/js-dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-theme-border bg-theme-surface hover:bg-theme-surface-muted shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold text-theme-body transition-colors no-underline"
          >
            <IconBrandGithub className="h-3.5 w-3.5 text-theme-muted" />
            100% Open Source · Star on GitHub
            <IconArrowRight className="h-3 w-3 text-brand-primary" />
          </motion.a>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-theme-heading leading-[1.08] tracking-tight"
          >
            {/* animated word */}
            <motion.span
              animate={{ width: wordWidth ? wordWidth + widthSafetyBuffer : "auto" }}
              transition={{ duration: 0.45, ease: easeInOut }}
              className="inline-flex overflow-hidden text-brand-primary bg-theme-icon-bg border border-[var(--theme-pseo-accent-border)] px-3 py-1 rounded-xl mr-2 align-middle"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={rotatingWords[active]}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                  transition={{ duration: 0.45, ease: easeInOut }}
                  className="inline-block whitespace-nowrap"
                >
                  {rotatingWords[active]}
                </motion.span>
              </AnimatePresence>
            </motion.span>
            {/* hidden measurement spans */}
            <span className="pointer-events-none absolute -z-10 opacity-0" aria-hidden="true">
              {rotatingWords.map((word, idx) => (
                <span
                  key={`measure-${word}`}
                  ref={(el) => { wordMeasureRefs.current[idx] = el; }}
                  className="inline-block whitespace-nowrap text-4xl md:text-6xl lg:text-7xl"
                >
                  {word}
                </span>
              ))}
            </span>
            Image &amp; Data Tools.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-theme-muted max-w-2xl leading-relaxed"
          >
            Professional browser tools for developers and designers. Convert, compress, format,
            and transform files — entirely on your device. No uploads. No accounts. Always free.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <MagneticButton>
              <ButtonLink
                to="/tools"
                preload="intent"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-md hover:bg-brand-hover transition-all duration-200"
              >
                Browse all tools
                <IconChevronRight className="h-4 w-4" />
              </ButtonLink>
            </MagneticButton>

          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={itemVariants}
            className="hidden sm:flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-xs text-theme-muted font-medium pt-1"
          >
            {[
              "100% Browser-Based",
              "No File Uploads",
              "Complete Privacy",
              "Free Forever",
            ].map((badge) => (
              <span key={badge} className="flex items-center gap-1.5">
                <IconCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── App screenshot with frame ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: easeInOut }}
          className="relative mt-14 w-full max-w-5xl mx-auto"
        >
          {/* layered shadow: soft outer glow + crisp drop shadow */}
          <div className="absolute -inset-1 rounded-3xl pointer-events-none"
            style={{
              boxShadow: "0 0 0 1px rgba(37,99,235,0.08), 0 24px 72px -8px rgba(37,99,235,0.14), 0 8px 24px -4px rgba(0,0,0,0.07)",
            }}
          />

          {/* outer frame border */}
          <div className="rounded-2xl border border-theme-border bg-white overflow-hidden"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.9)" }}
          >
            {/* browser top bar */}
            <div className="bg-[#f5f5f7] border-b border-theme-border/80 px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white border border-theme-border rounded-md px-4 py-1 text-xs text-theme-muted font-mono w-56 text-center">
                  snapbittools.com/tools
                </div>
              </div>
              <div className="w-12" />
            </div>

            {/* screenshot — no overflow-hidden here so we can fade past the frame edge */}
            <div className="relative">
              <img
                src="/screenshot.png"
                alt="SnapBit Tools interface preview"
                className="w-full block"
                loading="eager"
              />
              {/* bottom-only fade: starts transparent at 55% and is fully white by 100% */}
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                  height: "42%",
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.88) 70%, #ffffff 100%)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════
          MAIN CONTENT  (light)
      ════════════════════════════════ */}
      <main className="flex-1 px-4 pb-16 relative z-10 bg-theme-page" id="tools">

        {/* Featured tools */}
        <section className="max-w-7xl mx-auto pt-24 pb-16 fadeElement" id="tools">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-theme-heading">
                Most Used Tools
              </h2>
              <p className="text-sm text-theme-muted mt-1">Click any tool to open it instantly — no signup needed.</p>
            </div>
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-sm text-brand-primary font-semibold hover:text-brand-hover no-underline"
            >
              See all tools
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  to={tool.href}
                  className="group relative flex items-start gap-4 p-5 rounded-xl border border-theme-border bg-theme-card hover:border-brand-primary/40 hover:shadow-md hover:shadow-blue-50 transition-all duration-200 no-underline"
                >
                  <div className="w-11 h-11 rounded-lg bg-theme-icon-bg flex items-center justify-center shrink-0 group-hover:bg-theme-icon-bg-hover transition-colors">
                    <Icon className="text-brand-primary" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-theme-heading group-hover:text-brand-primary transition-colors truncate">
                        {tool.name}
                      </h3>
                      {tool.isNew && (
                        <span className="shrink-0 text-[10px] font-bold bg-brand-primary text-white px-1.5 py-0.5 rounded-full">NEW</span>
                      )}
                    </div>
                    <p className="text-xs text-theme-muted mt-0.5 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                    <span className="mt-2 inline-flex items-center text-xs text-brand-primary font-medium gap-0.5">
                      Try it
                      <IconChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </section>

        {/* Why SnapBit */}
        <section className="max-w-7xl mx-auto py-16 border-t border-gray-100 fadeElement">
          <h2 className="text-2xl font-bold text-theme-heading mb-10 text-center">
            Why <span className="text-brand-primary">SnapBit</span> Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LightFeatureCard
              icon={<IconLock className="text-brand-primary w-5 h-5" />}
              title="Complete Privacy"
              description="Your files never leave your device. Everything runs 100% in the browser — no servers, no tracking."
            />
            <LightFeatureCard
              icon={<IconBolt className="text-brand-primary w-5 h-5" />}
              title="Instant Performance"
              description="No upload queues or server wait times. Processing starts the moment you drop a file."
            />
            <LightFeatureCard
              icon={<IconBrandGithub className="text-brand-primary w-5 h-5" />}
              title="Free & Open Source"
              description="Every tool is free forever. The entire codebase is open source on GitHub."
            />
          </div>
        </section>

        {/* Who uses it */}
        <section className="max-w-7xl mx-auto py-16 border-t border-gray-100 fadeElement">
          <h2 className="text-2xl font-bold text-theme-heading mb-10 text-center">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Web Developers",
                description:
                  "Convert images to Base64 for embedded assets, format JSON API responses, convert between data formats, and validate code—all without leaving your browser.",
              },
              {
                title: "Content Creators",
                description:
                  "Compress images for web publishing, crop photos for social media, convert between formats for different platforms, and process batch conversions.",
              },
              {
                title: "Designers & Creatives",
                description:
                  "Optimize images, generate color palettes, resize for different ratios, lorem ipsum mockups — all the small tasks that slow your workflow.",
              },
              {
                title: "Data Professionals",
                description:
                  "Convert CSV to JSON and vice versa, format and validate JSON data, work with spreadsheets offline, all securely in your browser.",
              },
            ].map(({ title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-theme-border bg-theme-card p-6 hover:border-brand-primary/30 hover:shadow-sm transition-all"
              >
                <h4 className="text-base font-bold text-theme-heading mb-2">{title}</h4>
                <p className="text-sm text-theme-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-4xl mx-auto py-16 text-center border-t border-gray-100 fadeElement">
          <h3 className="text-2xl font-bold text-theme-heading mb-3">
            Everything you need, right in the browser
          </h3>
          <p className="text-theme-muted text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            From Base64 encoding to image compression, JSON formatting to spreadsheet conversion —
            our suite covers the daily file tasks that slow developers and designers down.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <ButtonLink
              to="/tools"
              className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow hover:bg-brand-hover transition-colors"
            >
              Go to all tools
            </ButtonLink>
            <a
              href="https://github.com/SiddharthaMishra-dev/js-dev-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-theme-border bg-theme-surface text-theme-body rounded-xl text-sm font-semibold hover:bg-theme-surface-muted transition-colors no-underline"
            >
              <IconBrandGithub className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pb-8 px-4 relative z-10 bg-theme-page border-t border-theme-border">
        <div className="max-w-4xl mx-auto text-center pt-8">
          <p className="text-theme-muted text-xs">
            Crafted with care by{" "}
            <a
              href="https://sidme.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-hover transition-colors"
            >
              sidme
            </a>{" "}
            •{" "}
            <a
              href="https://github.com/SiddharthaMishra-dev/js-dev-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-hover transition-colors"
            >
              Open Source on GitHub
            </a>
          </p>
        </div>
      </footer>
    </PageShell>
  );
}

function LightFeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-xl border border-theme-border bg-theme-card hover:border-brand-primary/30 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-lg bg-theme-icon-bg flex items-center justify-center">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-theme-heading mb-1">{title}</h4>
        <p className="text-sm text-theme-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
