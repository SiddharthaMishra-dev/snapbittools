import { createFileRoute } from "@tanstack/react-router";
import { compressionVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import { RouteComponent as ParentToolComponent } from "./image-compressor";

const variant = compressionVariants.find((v) => v.slug === "compress-jpeg-online")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/compress-jpeg-online")({
  head: () =>
    getSeoMetadata({
      title: variant.metaTitle,
      description: variant.metaDescription,
      keywords: [variant.primaryKeyword, ...variant.relatedVariants],
      url: `/${variant.slug}`,
      type: "software",
      faqs,
      breadcrumbs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const PseoPage = require("@/components/PseoPage").default;
  return (
    <PseoPage
      variant={variant}
      toolComponent={ParentToolComponent}
    />
  );
}
