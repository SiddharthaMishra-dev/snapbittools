import { createFileRoute } from "@tanstack/react-router";
import { jsonVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import PseoPage from "@/components/PseoPage";
import { JsonFormatterTool as ParentToolComponent } from "@/components/JsonFormatterTool";

const variant = jsonVariants.find((v) => v.slug === "json-minifier")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/_wrap/json-minifier")({
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
  return <PseoPage variant={variant} toolComponent={ParentToolComponent} />;
}
