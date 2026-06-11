import { createLink, createFileRoute } from "@tanstack/react-router";

import PageShell from "@/components/PageShell";
import { ToolsListing } from "@/components/ToolsListing";
import { getSeoMetadata } from "@/lib/seo";
import Button from "@/components/ui/button";

export const Route = createFileRoute("/tools")({
  head: () =>
    getSeoMetadata({
      title: "All Tools | SnapBit Tools",
      description:
        "Browse every SnapBit Tools utility in one place. Image converters, compressors, croppers, JSON formatter, CSV to XLSX, and more—private and client-side.",
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
            Browse all tools in one place. Image converters, compressors, croppers, JSON formatter, CSV to XLSX, CSV to JSON, and many more.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <ButtonLink
              to="/tools"
              hash="images"
              className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-md hover:bg-brand-hover transition-all duration-200"
            >
              Jump to tools
            </ButtonLink>
            <ButtonLink
              to="/"
              className="px-6 py-2.5 border border-theme-border bg-theme-surface text-theme-body rounded-xl text-sm font-semibold hover:bg-theme-surface-muted transition-colors"
            >
              Back to home
            </ButtonLink>
          </div>
        </div>
      </section>

      <ToolsListing />
    </PageShell>
  );
}
