import { createFileRoute } from "@tanstack/react-router";
import { jsonVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import { RouteComponent as ParentToolComponent } from "./json-formatter";

const variant = jsonVariants.find(v => v.slug === "validate-json-online")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/validate-json-online")({
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
    return <PseoPage variant={variant} toolComponent={ParentToolComponent} />;
}
