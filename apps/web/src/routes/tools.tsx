import { IconChevronRight } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import GlowCard from "@/components/ui/GlowCard";
import type { ToolDefinition } from "@/data/tools";
import { tools } from "@/data/tools";

import { getSeoMetadata } from "@/lib/seo";

export const Route = createFileRoute("/tools")({
  head: () =>
    getSeoMetadata({
      title: "All Tools | JS DevTools",
      description:
        "Browse every JS DevTools utility in one place. Image converters, compressors, croppers, JSON formatter, CSV to XLSX, and more—private and client-side.",
      keywords: [
        "online tools",
        "image tools",
        "json formatter",
        "csv to xlsx",
        "image compressor",
        "image converter",
        "privacy-first tools",
        "offline tools",
      ],
      url: "/tools",
    }),
  component: ToolsPage,
});

const toolsByCategory = tools.reduce<Record<string, ToolDefinition[]>>((acc, tool) => {
  if (!acc[tool.category]) acc[tool.category] = [];
  acc[tool.category].push(tool);
  return acc;
}, {});

function ToolsPage() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 flex flex-col relative overflow-hidden"
      id="top"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <section className="pt-24 pb-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-100">
            All JS DevTools utilities in one place
          </h1>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto">
            A crawlable, SEO-friendly index for privacy-first tools. Use it as your launchpad or
            share individual tools directly.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/"
              className="px-4 py-2.5 shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Back to home
            </Link>
            <a
              href="#images"
              className="px-4 py-2.5 shadow-[0px_0px_2px_1px_rgba(255, 255, 255,0.2)_inset] text-shadow-sm text-shadow-white/10 ring ring-white/20 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors"
            >
              Jump to tools
            </a>
          </div>
        </div>
      </section>

      <main className="flex-1 px-4 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <section
              key={category}
              id={category.toLowerCase()}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-gray-100">{category} tools</h2>
                  <p className="text-sm text-gray-300">
                    Optimized copy and internal links help each tool page index cleanly.
                  </p>
                </div>
                <a
                  href="#top"
                  className="text-sm text-brand-primary font-semibold hover:text-brand-hover flex items-center gap-1"
                >
                  Back to top
                  <IconChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTools.map((tool) => {
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
                          <p className="text-gray-200 text-sm leading-relaxed">
                            {tool.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {tool.keywords.map((keyword) => (
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
          ))}
        </div>
      </main>
    </div>
  );
}
