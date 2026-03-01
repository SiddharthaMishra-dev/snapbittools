import { createFileRoute } from "@tanstack/react-router";
import { formatConverterVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import * as ImageFormatConverterRoute from "./image-format-converter";

const variant = formatConverterVariants.find((v) => v.slug === "jpg-to-png")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/jpg-to-png")({
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
  const ParentToolComponent = ImageFormatConverterRoute.Route.options.component;
  const PseoPage = require("@/components/PseoPage").default;
  return ParentToolComponent ? (
    <PseoPage
      variant={variant}
      toolComponent={ParentToolComponent}
    />
  ) : null;
}
