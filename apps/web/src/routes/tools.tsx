import { createLink, createFileRoute } from "@tanstack/react-router";

import PageShell from "@/components/PageShell";
import { ToolsListing } from "@/components/ToolsListing";
import Button from "@/components/ui/button";
import { TOOL_CATEGORY_ORDER, toolCategories } from "@/data/tools";
import { getSeoMetadata } from "@/lib/seo";

export const Route = createFileRoute("/tools")({
  head: () =>
    getSeoMetadata({
      title: "All Tools | SnapBit Tools",
      description:
        "Browse every SnapBit Tools utility in one place. Image converters, PDF tools, JSON formatter, CSV to XLSX, and more—private and client-side.",
      keywords: [
        "online tools",
        "image tools",
        "pdf tools",
        "data tools",
        "utility tools",
        "json formatter",
        "image compressor",
        "privacy-first tools",
        "offline tools",
      ],
      url: "/tools",
    }),
  component: RouteComponent,
});

export function RouteComponent() {
  const ButtonLink = createLink(Button);

  return (
    <PageShell id="top">
      <section className="relative z-10 pt-28 pb-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-theme-heading mb-6 tracking-tight">
            <span className="text-brand-primary">SnapBit</span> Tools
          </h1>
          <p className="text-base md:text-lg text-theme-muted max-w-3xl mx-auto mb-8 leading-relaxed">
            Browse all tools in one place, grouped by type: images, PDFs, data, and everyday utilities.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {TOOL_CATEGORY_ORDER.map((category) => {
              const meta = toolCategories[category];
              return (
                <ButtonLink
                  key={category}
                  to={meta.href}
                  className="px-5 py-2.5 border border-theme-border bg-theme-surface text-theme-body rounded-xl text-sm font-semibold hover:bg-theme-surface-muted transition-colors"
                >
                  {meta.heading}
                </ButtonLink>
              );
            })}
          </div>
        </div>
      </section>

      <ToolsListing />
    </PageShell>
  );
}
