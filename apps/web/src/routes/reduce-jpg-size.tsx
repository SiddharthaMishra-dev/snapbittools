import { createFileRoute } from "@tanstack/react-router";
import { compressionVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import { RouteComponent as ParentToolComponent } from "./image-compressor";

const variant = compressionVariants.find(v => v.slug === "reduce-jpg-size")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/reduce-jpg-size")({
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
