/**
 * Internal Linking System
 * 
 * Manages internal links between pSEO pages for improved SEO and user navigation.
 * Generates contextual, keyword-rich links between related pages.
 */

import { allKeywordVariants, getRelatedVariants, type KeywordVariant } from "@/data/pseo-keywords";
import { tools } from "@/data/tools";

export interface InternalLink {
    href: string;
    title: string;
    description: string;
    anchorText: string;
    category: "related-variant" | "parent-tool" | "category-page" | "use-case";
}

/**
 * Generate internal links for a variant page
 * Returns 4-6 highly relevant links
 */
export function generateInternalLinks(currentSlug: string): InternalLink[] {
    const currentVariant = allKeywordVariants.find(v => v.slug === currentSlug);
    if (!currentVariant) return [];

    const links: InternalLink[] = [];

    // 1. Add parent tool link
    const parentTool = tools.find(t => t.slug === currentVariant.parentTool);
    if (parentTool) {
        links.push({
            href: parentTool.href,
            title: parentTool.name,
            description: parentTool.description,
            anchorText: `Try our ${parentTool.name}`,
            category: "parent-tool"
        });
    }

    // 2. Add related variant links (3-4 links)
    const relatedVariants = getRelatedVariants(currentSlug).slice(0, 4);
    for (const variant of relatedVariants) {
        links.push({
            href: `/${variant.slug}`,
            title: variant.h1,
            description: variant.metaDescription,
            anchorText: variant.h1,
            category: "related-variant"
        });
    }

    // 3. Add use-case page link if applicable
    if (currentVariant.searchIntent !== "use-case") {
        const useCaseLink = getUseCaseLink(currentVariant);
        if (useCaseLink) {
            links.push(useCaseLink);
        }
    }

    return links.slice(0, 6); // Limit to 6 links max
}

/**
 * Get contextual use-case page link
 */
function getUseCaseLink(variant: KeywordVariant): InternalLink | null {
    const useCaseMap: Record<string, string> = {
        converter: "tools-for-developers",
        compressor: "tools-for-designers",
        validator: "web-developer-toolkit"
    };

    const useCaseSlug = useCaseMap[variant.searchIntent];
    if (!useCaseSlug) return null;

    const useCaseVariant = allKeywordVariants.find(v => v.slug === useCaseSlug);
    if (!useCaseVariant) return null;

    return {
        href: `/${useCaseVariant.slug}`,
        title: useCaseVariant.h1,
        description: useCaseVariant.metaDescription,
        anchorText: `Explore ${useCaseVariant.h1}`,
        category: "use-case"
    };
}

/**
 * Generate contextual anchor text variations
 * Returns keyword-rich anchor text that's natural and varied
 */
export function generateAnchorText(variant: KeywordVariant, context: "inline" | "card" = "inline"): string {
    if (context === "card") {
        return variant.h1;
    }

    // Inline anchor text templates
    const templates = {
        converter: [
            `convert ${variant.targetFormat?.[0]} to ${variant.targetFormat?.[1]}`,
            `${variant.targetFormat?.[0]} to ${variant.targetFormat?.[1]} converter`,
            `${variant.h1.toLowerCase()}`,
        ],
        compressor: [
            `compress images ${variant.slug.includes("to-") ? variant.slug.split("to-")[1] : ""}`,
            `reduce image file size`,
            variant.primaryKeyword,
        ],
        validator: [
            variant.primaryKeyword,
            `${variant.h1.toLowerCase()} tool`,
            `format and validate JSON`,
        ],
        "use-case": [
            variant.primaryKeyword,
            variant.h1.toLowerCase(),
            `explore ${variant.h1.toLowerCase()}`,
        ]
    };

    const options = templates[variant.searchIntent] || [variant.h1.toLowerCase()];
    return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get breadcrumb links for navigation
 */
export function getBreadcrumbLinks(currentSlug: string): Array<{ label: string; href: string }> {
    const currentVariant = allKeywordVariants.find(v => v.slug === currentSlug);
    if (!currentVariant) return [];

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Tools", href: "/tools" }
    ];

    // Add parent tool if different from "tools"
    if (currentVariant.parentTool !== "tools") {
        const parentTool = tools.find(t => t.slug === currentVariant.parentTool);
        if (parentTool) {
            breadcrumbs.push({
                label: parentTool.name,
                href: parentTool.href
            });
        }
    }

    // Add current page
    breadcrumbs.push({
        label: currentVariant.h1,
        href: `/${currentVariant.slug}`
    });

    return breadcrumbs;
}

/**
 * Generate related tools component data
 */
export function getRelatedToolsData(currentSlug: string): Array<{
    slug: string;
    name: string;
    href: string;
    description: string;
    isPseoVariant: boolean;
}> {
    const currentVariant = allKeywordVariants.find(v => v.slug === currentSlug);
    if (!currentVariant) return [];

    const relatedVariants = getRelatedVariants(currentSlug).slice(0, 4);

    return relatedVariants.map(variant => ({
        slug: variant.slug,
        name: variant.h1,
        href: `/${variant.slug}`,
        description: variant.metaDescription,
        isPseoVariant: true
    }));
}

/**
 * Generate contextual link recommendations
 * Used in content sections to add inline links
 */
export function getContextualLinks(variant: KeywordVariant): InternalLink[] {
    const links: InternalLink[] = [];

    // Add format-specific links for converters
    if (variant.searchIntent === "converter" && variant.targetFormat) {
        const [fromFormat, toFormat] = variant.targetFormat;
        
        // Find reverse conversion
        const reverseVariant = allKeywordVariants.find(
            v => v.targetFormat?.[0] === toFormat && v.targetFormat?.[1] === fromFormat
        );
        
        if (reverseVariant) {
            links.push({
                href: `/${reverseVariant.slug}`,
                title: reverseVariant.h1,
                description: `Convert ${toFormat.toUpperCase()} back to ${fromFormat.toUpperCase()}`,
                anchorText: `${toFormat} to ${fromFormat} conversion`,
                category: "related-variant"
            });
        }
    }

    // Add compression link for converters
    if (variant.searchIntent === "converter") {
        const compressionVariant = allKeywordVariants.find(
            v => v.searchIntent === "compressor" && v.slug.includes("compress-image")
        );
        
        if (compressionVariant) {
            links.push({
                href: `/${compressionVariant.slug}`,
                title: compressionVariant.h1,
                description: "Also compress your images for web use",
                anchorText: "compress your images", 
                category: "related-variant"
            });
        }
    }

    return links;
}

/**
 * Validate internal link structure
 * Ensures no broken links and proper link distribution
 */
export function validateInternalLinks(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const variant of allKeywordVariants) {
        // Check related variants exist
        for (const relatedSlug of variant.relatedVariants) {
            const relatedVariant = allKeywordVariants.find(v => v.slug === relatedSlug);
            if (!relatedVariant) {
                errors.push(`Variant "${variant.slug}" references non-existent variant "${relatedSlug}"`);
            }
        }

        // Check parent tool exists
        const parentTool = tools.find(t => t.slug === variant.parentTool);
        if (!parentTool && variant.parentTool !== "tools") {
            errors.push(`Variant "${variant.slug}" references non-existent parent tool "${variant.parentTool}"`);
        }

        // Warn if too few related variants
        if (variant.relatedVariants.length < 3) {
            warnings.push(`Variant "${variant.slug}" has only ${variant.relatedVariants.length} related variants (recommended: 4-6)`);
        }

        // Warn if too many related variants
        if (variant.relatedVariants.length > 8) {
            warnings.push(`Variant "${variant.slug}" has ${variant.relatedVariants.length} related variants (recommended: 4-6)`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Generate site-wide link graph for visualization
 */
export function generateLinkGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};

    for (const variant of allKeywordVariants) {
        const links = generateInternalLinks(variant.slug);
        graph[variant.slug] = links.map(link => link.href.replace('/', ''));
    }

    return graph;
}
