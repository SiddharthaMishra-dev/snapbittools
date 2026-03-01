import { createFileRoute } from "@tanstack/react-router";
import { jsonVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import * as JsonFormatterRoute from "./json-formatter";

const variant = jsonVariants.find((v) => v.slug === "json-pretty-print")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/json-pretty-print")({
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
  const ParentToolComponent = JsonFormatterRoute.Route.options.component;
  const PseoPage = require("@/components/PseoPage").default;
  return ParentToolComponent ? (
    <PseoPage
      variant={variant}
      toolComponent={ParentToolComponent}
    />
  ) : null;
}
