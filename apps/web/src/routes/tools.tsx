import { Link, createFileRoute, createLink } from "@tanstack/react-router";

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
    <div
      className="min-h-screen bg-white flex flex-col font-sans relative"
      id="top"
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.45,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 100%)",
        }}
      />

      <section className="relative z-10 pt-28 pb-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            <span className="text-brand-primary">SnapBit</span> Tools
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-3xl mx-auto mb-8 leading-relaxed">
            Browse all tools in one place. Image converters, compressors, croppers, JSON formatter,
            CSV to XLSX, CSV to JSON, and many more.
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
              className="px-6 py-2.5 border border-gray-200 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to home
            </ButtonLink>
          </div>
        </div>
      </section>

      <ToolsListing theme="light" />
    </div>
  );
}
