import { createFileRoute } from "@tanstack/react-router";
import { useCaseVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import PseoPage from "@/components/PseoPage";
import { ToolsListing } from "@/components/ToolsListing";

const variant = useCaseVariants.find((v) => v.slug === "privacy-first-tools")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/privacy-first-tools")({
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
  return <PseoPage variant={variant} toolComponent={ToolsListing} />;
}
