import type { ReactNode } from "react";

import {
  IconBolt,
  IconBrandGithub,
  IconChevronRight,
  IconLock,
  IconSearch,
} from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import GlowCard from "@/components/ui/GlowCard";
import { tools } from "@/data/tools";

import { getSeoMetadata } from "@/lib/seo";

const featuredTools = tools.slice(0, 6);

export const Route = createFileRoute("/")({
  head: () =>
    getSeoMetadata({
      title: "JS DevTools | Private & Fast Image and Data Tools",
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <section className="pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 leading-tight">
            Free Online Tools for Image Conversion, Compression & Data Formatting
          </h1>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto">
            Professional-grade online tools that work entirely in your browser. Convert images to
            Base64, compress photos, format JSON, convert CSV to Excel, and more—all without
            uploading files to any server. Fast, secure, and 100% free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/tools"
              className=" inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-primary shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 text-white rounded-lg hover:bg-brand-hover transition-colors duration-200 text-sm font-medium"
            >
              <span>Browse all tools</span>
              <IconChevronRight className="h-4 w-4" />
            </Link>

            <a
              href="https://github.com/SiddharthaMishra-dev/js-dev-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
            >
              <IconBrandGithub className="w-4 h-4" />
              <span>Star on GitHub</span>
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              ✓ 100% Browser-Based Processing
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              ✓ No File Uploads Required
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              ✓ Complete Privacy Protection
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              ✓ Free & Open Source
            </span>
          </div>
        </div>
      </section>

      <main
        className="flex-1 px-4 pb-16 relative z-10"
        id="tools"
      >
        <section className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Most Used Image & Data Conversion Tools
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Powerful online utilities for converting images, compressing files, and formatting
                data. All tools process files locally in your browser for maximum privacy and speed.
              </p>
            </div>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 text-sm text-brand-primary font-semibold hover:text-brand-hover"
            >
              See catalog
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <GlowCard
                  key={tool.slug}
                  to={tool.href}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-brand-dark rounded-lg flex items-center justify-center group-hover:bg-brand-primary transition-colors ease-in-out">
                        <Icon className="text-brand-light" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-300 mb-2 group-hover:text-brand-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-gray-200 text-sm leading-relaxed">{tool.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tool.keywords.slice(0, 2).map((keyword) => (
                          <span
                            key={keyword}
                            className="text-[11px] uppercase tracking-wide text-brand-light bg-white/5 border border-white/10 rounded-full px-2 py-1"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center text-brand-primary text-sm font-medium">
                        <span>Open tool</span>
                        <IconChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-8">Why Choose Our Online Tools?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<IconBolt className="text-brand-light w-6 h-6" />}
              title="Lightning-Fast Performance"
              description="All processing happens instantly in your browser—no server delays, no waiting for uploads."
            />
            <FeatureCard
              icon={<IconLock className="text-brand-light w-6 h-6" />}
              title="Complete Privacy & Security"
              description="Your files never leave your device. No uploads, no cloud storage, no data collection."
            />
            <FeatureCard
              icon={<IconBrandGithub className="text-brand-light w-6 h-6" />}
              title="100% Free & Open Source"
              description="All tools are free to use forever. Inspect the code, contribute, or fork on GitHub."
            />
            <FeatureCard
              icon={<IconSearch className="text-brand-light w-6 h-6" />}
              title="Works Offline"
              description="Client-side processing means tools work without internet connection after initial load."
            />
          </div>
        </section>

        <section className="max-w-5xl mx-auto mt-16 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-semibold text-brand-primary text-gray-100 mt-2">
            Everything You Need for Image Processing & Data Conversion
          </h3>
          <p className="text-gray-300 mt-3">
            From converting images to Base64 encoding, compressing photos to reduce file size,
            formatting JSON data, to converting spreadsheets—our comprehensive suite handles all
            your file conversion and processing needs with professional results, all in your
            browser.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/tools"
              className="px-5 py-2.5 shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors"
            >
              Go to tools page
            </Link>
            <a
              href="#tools"
              className="px-5 py-2.5 shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Explore featured tools
            </a>
          </div>
        </section>
      </main>

      <footer className="pb-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-xs">
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
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="w-12 h-12 bg-brand-dark rounded-lg flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-100">{title}</h4>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
}
