#!/usr/bin/env node

/**
 * Route Generator Script
 * 
 * Generates route files for pSEO variants.
 * Usage: bun scripts/generate-pseo-routes.js [priority]
 * Example: bun scripts/generate-pseo-routes.js 1  // Generates Phase 1 routes only (23 new routes)
 * 
 * Note: Uses bun runtime for TypeScript support (Node.js requires ts-node or tsx)
 */

import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import {
    allKeywordVariants,
    getVariantsByPriority,
    formatConverterVariants,
    compressionVariants,
    jsonVariants,
    useCaseVariants
} from "../apps/web/src/data/pseo-keywords";

// Map parent tools to their route component paths
const TOOL_COMPONENT_MAP = {
    "image-format-converter": "./image-format-converter",
    "image-compressor": "./image-compressor",
    "json-formatter": "./json-formatter",
    "image-cropper": "./image-cropper",
    "image-to-base64": "./image-to-base64",
    "image-to-pdf": "./image-to-pdf",
    "csv-xlsx-converter": "./csv-xlsx-converter",
    "csv-to-json": "./csv-to-json",
    "json-to-csv": "./json-to-csv",
    "diff-checker": "./diff-checker",
    "word-counter": "./word-counter",
    "lorem-ipsum-generator": "./lorem-ipsum-generator",
    "tools": "./tools",
};

// Determine which data array to import from
function getVariantDataSource(variant) {
    if (formatConverterVariants.includes(variant)) return "formatConverterVariants";
    if (compressionVariants.includes(variant)) return "compressionVariants";
    if (jsonVariants.includes(variant)) return "jsonVariants";
    if (useCaseVariants.includes(variant)) return "useCaseVariants";
    return "allKeywordVariants";
}

// Generate route file content
function generateRouteFile(variant) {
    const dataSource = getVariantDataSource(variant);
    const toolImportPath = TOOL_COMPONENT_MAP[variant.parentTool] || "./tools";
    
    return `import { createFileRoute } from "@tanstack/react-router";
import { ${dataSource} } from "@/data/pseo-keywords";
import { getSeoMetadata } from "@/lib/seo";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import { RouteComponent as ParentToolComponent } from "${toolImportPath}";

const variant = ${dataSource}.find(v => v.slug === "${variant.slug}")!;
const { faqs } = generatePageContent(variant);
const breadcrumbs = generateBreadcrumbs(variant);

export const Route = createFileRoute("/${variant.slug}")({
    head: () =>
        getSeoMetadata({
            title: variant.metaTitle,
            description: variant.metaDescription,
            keywords: [variant.primaryKeyword, ...variant.relatedVariants],
            url: \`/\${variant.slug}\`,
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
`;
}

// Generate sitemap entries
function generateSitemapEntries(variants) {
    const today = new Date().toISOString().split('T')[0];
    
    return variants.map(variant => `  <url>
    <loc>https://snapbittools.com/${variant.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${variant.priority === 1 ? '0.8' : '0.7'}</priority>
  </url>`).join('\n');
}

// Main generation function
function generateRoutes(priority) {
    const variantsToGenerate = priority 
        ? getVariantsByPriority(priority)
        : allKeywordVariants;

    console.log(`🚀 Generating routes for ${variantsToGenerate.length} variants${priority ? ` (Priority ${priority})` : ''}...`);

    let generated = 0;
    let skipped = 0;

    for (const variant of variantsToGenerate) {
        const routePath = join(process.cwd(), "apps/web/src/routes", `${variant.slug}.tsx`);
        
        // Skip if file already exists (to avoid overwriting customizations)
        if (existsSync(routePath)) {
            console.log(`⏭️  Skipped ${variant.slug}.tsx (already exists)`);
            skipped++;
            continue;
        }

        const content = generateRouteFile(variant);
        writeFileSync(routePath, content, "utf-8");
        console.log(`✅ Generated ${variant.slug}.tsx`);
        generated++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Generated: ${generated} routes`);
    console.log(`   Skipped: ${skipped} routes`);
    console.log(`   Total: ${variantsToGenerate.length} routes`);

    // Generate sitemap entries
    console.log(`\n📄 Sitemap entries (add to public/sitemap.xml):`);
    console.log('\n' + generateSitemapEntries(variantsToGenerate) + '\n');
}

// CLI execution
const args = process.argv.slice(2);
const priority = args[0] ? parseInt(args[0], 10) : undefined;

if (priority && (priority < 1 || priority > 3)) {
    console.error("❌ Error: Priority must be 1, 2, or 3");
    process.exit(1);
}

generateRoutes(priority);

export { generateRoutes, generateRouteFile, generateSitemapEntries };
