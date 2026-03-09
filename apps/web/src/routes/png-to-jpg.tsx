/**
 * PNG to JPG Converter - pSEO Variant Page
 *
 * This is an example of how to create pSEO variant pages.
 * Each variant uses the same parent tool component but with unique SEO content.
 */

import { createFileRoute } from "@tanstack/react-router";
import { formatConverterVariants } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import PseoPage from "@/components/PseoPage";

// Import the parent tool route to reuse its component
import * as ImageFormatConverterRoute from "./image-format-converter";

// Get the variant data for this specific page
const variant = formatConverterVariants.find((v) => v.slug === "png-to-jpg")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/png-to-jpg")({
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
    // Use the parent tool's component
    const ParentToolComponent = ImageFormatConverterRoute.Route.options.component;

    return ParentToolComponent ? <PseoPage variant={variant} toolComponent={ParentToolComponent} /> : null;
}
