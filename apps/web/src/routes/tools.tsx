import { Link, createFileRoute } from "@tanstack/react-router";

import { ToolsListing } from "@/components/ToolsListing";
import { getSeoMetadata } from "@/lib/seo";

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
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col relative overflow-hidden"
      id="top"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <section className="pt-24 pb-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-100">
            All SnapBit Tools utilities in one place
          </h1>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto">
            Browse all tools in one place. Image converters, compressors, croppers, JSON formatter,
            CSV to XLSX , CSV to JSON and many more.
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

      <ToolsListing />
    </div>
  );
}
