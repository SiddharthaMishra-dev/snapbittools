import { createFileRoute } from "@tanstack/react-router";
import { formatConverterVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import PseoPage from "@/components/PseoPage";
import * as ImageFormatConverterRoute from "./_wrap.image-format-converter";

const variant = formatConverterVariants.find((v) => v.slug === "jpg-to-png")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/_wrap/jpg-to-png")({
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
  return ParentToolComponent ? <PseoPage variant={variant} toolComponent={ParentToolComponent} /> : null;
}
