/**
 * Content Quality Safeguards
 * 
 * Validates pSEO content to prevent thin content, detect duplicates,
 * and ensure high-quality, unique pages.
 */

import { allKeywordVariants, type KeywordVariant } from "@/data/pseo-keywords";
import { generatePageContent } from "./pseo-templates";

export interface QualityCheck {
    passed: boolean;
    errors: string[];
    warnings: string[];
    score: number; // 0-100
}

export interface PageQualityMetrics {
    wordCount: number;
    uniqueContentRatio: number; // 0-1
    headingsCount: number;
    linksCount: number;
    faqCount: number;
    hasThinContent: boolean;
    isDuplicate: boolean;
}

/**
 * Validate a single variant for content quality
 */
export function validateVariantQuality(variant: KeywordVariant): QualityCheck {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    const { sections, faqs } = generatePageContent(variant);
    const metrics = calculatePageMetrics(variant, sections, faqs);

    // CRITICAL CHECKS (errors that prevent indexing)
    
    // 1. Minimum word count (300 words minimum)
    if (metrics.wordCount < 300) {
        errors.push(`Word count too low: ${metrics.wordCount} words (minimum: 300)`);
        score -= 30;
    }

    // 2. Check for duplicate content
    if (metrics.isDuplicate) {
        errors.push("Content appears to be duplicate of another page");
        score -= 50;
    }

    // 3. Ensure unique H1
    const h1Duplicates = allKeywordVariants.filter(v => v.h1 === variant.h1 && v.slug !== variant.slug);
    if (h1Duplicates.length > 0) {
        errors.push(`H1 "${variant.h1}" is duplicated on: ${h1Duplicates.map(v => v.slug).join(', ')}`);
        score -= 40;
    }

    // 4. Meta description length
    if (variant.metaDescription.length < 120) {
        errors.push(`Meta description too short: ${variant.metaDescription.length} chars (minimum: 120)`);
        score -= 10;
    }
    if (variant.metaDescription.length > 160) {
        warnings.push(`Meta description too long: ${variant.metaDescription.length} chars (maximum: 160)`);
        score -= 5;
    }

    // WARNING CHECKS (quality improvements)

    // 5. Check unique content ratio
    if (metrics.uniqueContentRatio < 0.3) {
        warnings.push(`Low unique content ratio: ${(metrics.uniqueContentRatio * 100).toFixed(0)}% (target: 30%+)`);
        score -= 10;
    }

    // 6. Check heading structure
    if (metrics.headingsCount < 3) {
        warnings.push(`Only ${metrics.headingsCount} headings (recommended: 5+)`);
        score -= 5;
    }

    // 7. Check FAQ count
    if (metrics.faqCount < 4) {
        warnings.push(`Only ${metrics.faqCount} FAQs (recommended: 4-6)`);
        score -= 5;
    }

    // 8. Check internal links
    if (metrics.linksCount < 4) {
        warnings.push(`Only ${metrics.linksCount} internal links (recommended: 4-6)`);
        score -= 5;
    }

    // 9. Check for keyword stuffing in intro
    const keywordDensity = calculateKeywordDensity(variant.uniqueContent.intro, variant.primaryKeyword);
    if (keywordDensity > 0.03) { // More than 3%
        warnings.push(`Potential keyword stuffing: ${(keywordDensity * 100).toFixed(1)}% density (maximum: 3%)`);
        score -= 10;
    }

    // 10. Check title length
    if (variant.metaTitle.length > 60) {
        warnings.push(`Title too long: ${variant.metaTitle.length} chars (maximum: 60)`);
        score -= 5;
    }

    return {
        passed: errors.length === 0,
        errors,
        warnings,
        score: Math.max(0, score)
    };
}

/**
 * Calculate metrics for a page
 */
function calculatePageMetrics(
    variant: KeywordVariant, 
    sections: any[], 
    faqs: any[]
): PageQualityMetrics {
    // Count total words
    const allText = sections.map(s => stripHtml(s.content)).join(' ');
    const wordCount = countWords(allText);

    // Calculate unique content ratio
    const uniqueContent = variant.uniqueContent.intro + variant.uniqueContent.useCases.join(' ') + variant.uniqueContent.helpText;
    const uniqueWords = countWords(uniqueContent);
    const uniqueContentRatio = uniqueWords / wordCount;

    // Count headings
    const headingsCount = sections.reduce((count, section) => {
        return count + (section.content.match(/<h[2-6]>/gi) || []).length;
    }, 0);

    // Count internal links
    const linksCount = variant.relatedVariants.length;

    // FAQ count
    const faqCount = faqs.length;

    // Check for thin content indicators
    const hasThinContent = wordCount < 300 || uniqueContentRatio < 0.25;

    // Check for duplicate intro content
    const isDuplicate = checkForDuplicates(variant);

    return {
        wordCount,
        uniqueContentRatio,
        headingsCount,
        linksCount,
        faqCount,
        hasThinContent,
        isDuplicate
    };
}

/**
 * Check if variant content is too similar to others
 */
function checkForDuplicates(variant: KeywordVariant): boolean {
    const currentIntro = variant.uniqueContent.intro.toLowerCase();
    
    for (const other of allKeywordVariants) {
        if (other.slug === variant.slug) continue;
        
        const similarity = calculateSimilarity(currentIntro, other.uniqueContent.intro.toLowerCase());
        
        // If more than 80% similar, flag as duplicate
        if (similarity > 0.8) {
            return true;
        }
    }
    
    return false;
}

/**
 * Calculate text similarity (simple Jaccard similarity)
 */
function calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(text: string, keyword: string): number {
    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    
    const keywordOccurrences = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length;
    const totalWords = countWords(text);
    
    return keywordOccurrences / totalWords;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Validate all variants and generate report
 */
export function validateAllVariants(): {
    totalVariants: number;
    passed: number;
    failed: number;
    avgScore: number;
    issues: Array<{ slug: string; check: QualityCheck }>;
} {
    const results = allKeywordVariants.map(variant => ({
        slug: variant.slug,
        check: validateVariantQuality(variant)
    }));

    const failed = results.filter(r => !r.check.passed);
    const avgScore = results.reduce((sum, r) => sum + r.check.score, 0) / results.length;

    return {
        totalVariants: allKeywordVariants.length,
        passed: results.length - failed.length,
        failed: failed.length,
        avgScore: Math.round(avgScore),
        issues: results.filter(r => r.check.errors.length > 0 || r.check.warnings.length > 0)
    };
}

/**
 * Check for keyword intent overlap
 * Prevents creating multiple pages targeting the same search intent
 */
export function detectKeywordOverlap(): Array<{
    keyword: string;
    variants: string[];
}> {
    const keywordMap = new Map<string, string[]>();

    for (const variant of allKeywordVariants) {
        const normalized = normalizeKeyword(variant.primaryKeyword);
        
        if (!keywordMap.has(normalized)) {
            keywordMap.set(normalized, []);
        }
        
        keywordMap.get(normalized)!.push(variant.slug);
    }

    // Find keywords with multiple variants
    const overlaps: Array<{ keyword: string; variants: string[] }> = [];
    
    for (const [keyword, variants] of keywordMap.entries()) {
        if (variants.length > 1) {
            overlaps.push({ keyword, variants });
        }
    }

    return overlaps;
}

/**
 * Normalize keyword for comparison
 */
function normalizeKeyword(keyword: string): string {
    return keyword
        .toLowerCase()
        .replace(/online|free|tool|converter|compressor/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Generate content quality report
 */
export function generateQualityReport(): string {
    const report = validateAllVariants();
    const overlaps = detectKeywordOverlap();

    let output = '# Content Quality Report\n\n';
    
    output += `## Overview\n`;
    output += `- Total Variants: ${report.totalVariants}\n`;
    output += `- Passed: ${report.passed} (${((report.passed / report.totalVariants) * 100).toFixed(1)}%)\n`;
    output += `- Failed: ${report.failed}\n`;
    output += `- Average Score: ${report.avgScore}/100\n\n`;

    if (overlaps.length > 0) {
        output += `## ⚠️ Keyword Overlaps (${overlaps.length})\n\n`;
        for (const overlap of overlaps) {
            output += `- **${overlap.keyword}**: ${overlap.variants.join(', ')}\n`;
        }
        output += '\n';
    }

    if (report.issues.length > 0) {
        output += `## Issues Found (${report.issues.length})\n\n`;
        
        for (const issue of report.issues) {
            output += `### ${issue.slug} (Score: ${issue.check.score}/100)\n\n`;
            
            if (issue.check.errors.length > 0) {
                output += `**Errors:**\n`;
                for (const error of issue.check.errors) {
                    output += `- ❌ ${error}\n`;
                }
                output += '\n';
            }
            
            if (issue.check.warnings.length > 0) {
                output += `**Warnings:**\n`;
                for (const warning of issue.check.warnings) {
                    output += `- ⚠️ ${warning}\n`;
                }
                output += '\n';
            }
        }
    }

    return output;
}

/**
 * Enforce quality gates before deployment
 */
export function enforceQualityGates(minScore: number = 70): {
    canDeploy: boolean;
    blockers: string[];
} {
    const report = validateAllVariants();
    const blockers: string[] = [];

    // Check average score
    if (report.avgScore < minScore) {
        blockers.push(`Average quality score (${report.avgScore}) below minimum (${minScore})`);
    }

    // Check for critical failures
    const criticalFailures = report.issues.filter(i => i.check.errors.length > 0);
    if (criticalFailures.length > 0) {
        blockers.push(`${criticalFailures.length} variants have critical errors`);
    }

    // Check for keyword overlaps
    const overlaps = detectKeywordOverlap();
    if (overlaps.length > 0) {
        blockers.push(`${overlaps.length} keyword overlaps detected`);
    }

    return {
        canDeploy: blockers.length === 0,
        blockers
    };
}
