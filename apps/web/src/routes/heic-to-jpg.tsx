import { createFileRoute } from "@tanstack/react-router";
import { formatConverterVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import { RouteComponent as ParentToolComponent } from "./image-format-converter";

const variant = formatConverterVariants.find(v => v.slug === "heic-to-jpg")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/heic-to-jpg")({
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
