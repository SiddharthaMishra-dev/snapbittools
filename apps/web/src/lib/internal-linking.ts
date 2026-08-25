/**
 * Internal Linking System
 *
 * Manages internal links between pSEO pages for improved SEO and user navigation.
 * Generates contextual, keyword-rich links between related pages.
 */

import { allKeywordVariants, getRelatedVariants, getVariantsByParentTool, type KeywordVariant } from "@/data/pseo-keywords";
import { isCanonicalizedPath } from "@/lib/seo";
import { tools } from "@/data/tools";

const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));
const variantsBySlug = new Map(allKeywordVariants.map((variant) => [variant.slug, variant]));

export interface InternalLink {
  href: string;
  title: string;
  description: string;
  anchorText: string;
  category: "related-variant" | "parent-tool" | "category-page" | "use-case";
}

export type ClusterLink = {
  href: string;
  name: string;
  description: string;
};

/**
 * pSEO routes that exist on disk. Keep in sync with `src/routes`.
 * Canonicalized clones stay in this set (the URL works) but are not linked.
 */
const PUBLISHED_PSEO_SLUGS = new Set([
  "jpg-to-png",
  "png-to-jpg",
  "png-to-webp",
  "webp-to-png",
  "jpg-to-webp",
  "webp-to-jpg",
  "heic-to-jpg",
  "compress-image-to-50kb",
  "compress-image-to-100kb",
  "compress-image-to-200kb",
  "compress-jpeg-online",
  "compress-png-online",
  "compress-image-for-web",
  "optimize-images-for-website",
  "compress-image-online",
  "reduce-image-file-size",
  "reduce-jpg-size",
  "reduce-png-size",
  "json-pretty-print",
  "json-beautifier",
  "json-validator",
  "json-minifier",
  "format-json-online",
  "validate-json-online",
  "image-tools",
  "privacy-first-tools",
  "browser-based-utilities",
  "tools-for-developers",
]);

export function isIndexablePseoSlug(slug: string): boolean {
  return PUBLISHED_PSEO_SLUGS.has(slug) && !isCanonicalizedPath(`/${slug}`);
}

function variantToClusterLink(variant: KeywordVariant): ClusterLink {
  return {
    href: `/${variant.slug}`,
    name: variant.h1,
    description: variant.metaDescription,
  };
}

function clusterHeadingForIntent(intent: KeywordVariant["searchIntent"]): string {
  if (intent === "converter") return "Related converters";
  if (intent === "compressor") return "Related compression tools";
  if (intent === "validator") return "Related JSON tools";
  return "Related tools";
}

export function getClusterHeading(slug: string): string {
  const variant = variantsBySlug.get(slug);
  if (!variant) return "Related tools";
  return clusterHeadingForIntent(variant.searchIntent);
}

/** Indexable spokes to list on a pillar page (4–8). */
export function getPillarSpokes(parentToolSlug: string, limit = 8): ClusterLink[] {
  return getVariantsByParentTool(parentToolSlug)
    .filter((variant) => isIndexablePseoSlug(variant.slug))
    .slice(0, limit)
    .map(variantToClusterLink);
}

/**
 * Pillar + sibling links for a pSEO spoke. Skips unpublished and canonicalized URLs.
 */
export function getSpokeClusterLinks(currentSlug: string, limit = 6): ClusterLink[] {
  const current = variantsBySlug.get(currentSlug);
  if (!current) return [];

  const links: ClusterLink[] = [];
  const seen = new Set<string>();

  const push = (link: ClusterLink) => {
    if (seen.has(link.href) || links.length >= limit) return;
    seen.add(link.href);
    links.push(link);
  };

  const parentTool = toolsBySlug.get(current.parentTool);
  if (parentTool) {
    push({
      href: parentTool.href,
      name: parentTool.name,
      description: parentTool.description,
    });
  } else if (current.parentTool === "tools") {
    push({
      href: "/tools",
      name: "All Tools",
      description: "Browse every SnapBit utility in one place.",
    });
  }

  for (const slug of current.relatedVariants) {
    if (slug === currentSlug) continue;
    const tool = toolsBySlug.get(slug);
    if (tool) {
      push({ href: tool.href, name: tool.name, description: tool.description });
      continue;
    }
    const variant = variantsBySlug.get(slug);
    if (variant && isIndexablePseoSlug(variant.slug)) {
      push(variantToClusterLink(variant));
    }
  }

  if (current.parentTool !== "tools") {
    for (const sibling of getVariantsByParentTool(current.parentTool)) {
      if (sibling.slug === currentSlug || !isIndexablePseoSlug(sibling.slug)) continue;
      push(variantToClusterLink(sibling));
    }
  }

  return links;
}

/**
 * Generate internal links for a variant page
 * Returns 4-6 highly relevant links
 */
export function generateInternalLinks(currentSlug: string): InternalLink[] {
  const currentVariant = allKeywordVariants.find((v) => v.slug === currentSlug);
  if (!currentVariant) return [];

  const links: InternalLink[] = [];

  // 1. Add parent tool link
  const parentTool = tools.find((t) => t.slug === currentVariant.parentTool);
  if (parentTool) {
    links.push({
      href: parentTool.href,
      title: parentTool.name,
      description: parentTool.description,
      anchorText: `Try our ${parentTool.name}`,
      category: "parent-tool",
    });
  }

  // 2. Add related variant links (3-4 links)
  const relatedVariants = getRelatedVariants(currentSlug).filter((variant) => isIndexablePseoSlug(variant.slug));
  for (const variant of relatedVariants.slice(0, 4)) {
    links.push({
      href: `/${variant.slug}`,
      title: variant.h1,
      description: variant.metaDescription,
      anchorText: variant.h1,
      category: "related-variant",
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
    validator: "web-developer-toolkit",
  };

  const useCaseSlug = useCaseMap[variant.searchIntent];
  if (!useCaseSlug) return null;

  const useCaseVariant = allKeywordVariants.find((v) => v.slug === useCaseSlug);
  if (!useCaseVariant || !isIndexablePseoSlug(useCaseVariant.slug)) return null;

  return {
    href: `/${useCaseVariant.slug}`,
    title: useCaseVariant.h1,
    description: useCaseVariant.metaDescription,
    anchorText: `Explore ${useCaseVariant.h1}`,
    category: "use-case",
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
    validator: [variant.primaryKeyword, `${variant.h1.toLowerCase()} tool`, `format and validate JSON`],
    "use-case": [variant.primaryKeyword, variant.h1.toLowerCase(), `explore ${variant.h1.toLowerCase()}`],
  };

  const options = templates[variant.searchIntent] || [variant.h1.toLowerCase()];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get breadcrumb links for navigation
 */
export function getBreadcrumbLinks(currentSlug: string): Array<{ label: string; href: string }> {
  const currentVariant = allKeywordVariants.find((v) => v.slug === currentSlug);
  if (!currentVariant) return [];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
  ];

  // Add parent tool if different from "tools"
  if (currentVariant.parentTool !== "tools") {
    const parentTool = tools.find((t) => t.slug === currentVariant.parentTool);
    if (parentTool) {
      breadcrumbs.push({
        label: parentTool.name,
        href: parentTool.href,
      });
    }
  }

  // Add current page
  breadcrumbs.push({
    label: currentVariant.h1,
    href: `/${currentVariant.slug}`,
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
  return getSpokeClusterLinks(currentSlug).map((link) => ({
    slug: link.href.replace(/^\//, ""),
    name: link.name,
    href: link.href,
    description: link.description,
    isPseoVariant: isIndexablePseoSlug(link.href.replace(/^\//, "")),
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
    const reverseVariant = allKeywordVariants.find((v) => v.targetFormat?.[0] === toFormat && v.targetFormat?.[1] === fromFormat);

    if (reverseVariant) {
      links.push({
        href: `/${reverseVariant.slug}`,
        title: reverseVariant.h1,
        description: `Convert ${toFormat.toUpperCase()} back to ${fromFormat.toUpperCase()}`,
        anchorText: `${toFormat} to ${fromFormat} conversion`,
        category: "related-variant",
      });
    }
  }

  // Add compression link for converters
  if (variant.searchIntent === "converter") {
    const compressionVariant = allKeywordVariants.find((v) => v.searchIntent === "compressor" && v.slug.includes("compress-image"));

    if (compressionVariant) {
      links.push({
        href: `/${compressionVariant.slug}`,
        title: compressionVariant.h1,
        description: "Also compress your images for web use",
        anchorText: "compress your images",
        category: "related-variant",
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
      const relatedVariant = allKeywordVariants.find((v) => v.slug === relatedSlug);
      if (!relatedVariant) {
        errors.push(`Variant "${variant.slug}" references non-existent variant "${relatedSlug}"`);
      }
    }

    // Check parent tool exists
    const parentTool = tools.find((t) => t.slug === variant.parentTool);
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
    warnings,
  };
}

/**
 * Generate site-wide link graph for visualization
 */
export function generateLinkGraph(): Record<string, string[]> {
  const graph: Record<string, string[]> = {};

  for (const variant of allKeywordVariants) {
    const links = generateInternalLinks(variant.slug);
    graph[variant.slug] = links.map((link) => link.href.replace("/", ""));
  }

  return graph;
}
