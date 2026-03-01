import { createFileRoute } from "@tanstack/react-router";
import { compressionVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import PseoPage from "@/components/PseoPage";
import { ImageCompressorTool } from "@/components/ImageCompressorTool";

const variant = compressionVariants.find((v) => v.slug === "compress-image-to-100kb")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/compress-image-to-100kb")({
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
  return (
    <PseoPage
      variant={variant}
      toolComponent={ImageCompressorTool}
    />
  );
}
