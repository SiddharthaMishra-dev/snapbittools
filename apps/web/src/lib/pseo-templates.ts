/**
 * pSEO Content Templates
 * 
 * Reusable content templates for programmatic SEO pages.
 * Each template generates unique, high-quality content based on keyword variant data.
 */

import { type KeywordVariant } from "@/data/pseo-keywords";

export interface ContentSection {
    title: string;
    content: string;
    type: "intro" | "howto" | "benefits" | "usecases" | "privacy" | "faqs";
}

/**
 * Generate intro section with unique content
 */
export function generateIntroSection(variant: KeywordVariant): ContentSection {
    return {
        title: "",
        content: variant.uniqueContent.intro,
        type: "intro"
    };
}

/**
 * Generate "How it works" section
 */
export function generateHowItWorksSection(variant: KeywordVariant): ContentSection {
    const templates: Record<string, string> = {
        converter: `
            <h2>How to Use the ${variant.h1}</h2>
            <p>Converting ${variant.targetFormat?.[0]?.toUpperCase() || "your files"} is simple and fast:</p>
            <ol>
                <li><strong>Select your file:</strong> Click the upload button or drag and drop your ${variant.targetFormat?.[0]?.toUpperCase() || "file"} directly into the browser.</li>
                <li><strong>Automatic conversion:</strong> The tool instantly converts your file in your browser using optimized Web Workers.</li>
                <li><strong>Download result:</strong> Download your converted ${variant.targetFormat?.[1]?.toUpperCase() || "file"} immediately, or continue with batch conversions.</li>
            </ol>
            <p>The entire process takes seconds and happens entirely in your browser. No upload delays, no waiting for server processing, and complete privacy since files never leave your device.</p>
        `,
        compressor: `
            <h2>How to Compress Your Images</h2>
            <p>Compressing images to your target size is quick and automatic:</p>
            <ol>
                <li><strong>Upload image:</strong> Select your image file or drag it into the browser window.</li>
                <li><strong>Set target size:</strong> Choose your desired file size target (or use our optimized presets).</li>
                <li><strong>Automatic optimization:</strong> Our intelligent algorithm compresses your image while preserving maximum quality.</li>
                <li><strong>Preview and download:</strong> Review the result, compare with the original, and download when satisfied.</li>
            </ol>
            <p>The compression algorithm automatically adjusts quality, format, and optimization techniques to hit your target while maintaining the best possible visual quality. Everything processes in your browser with no uploads.</p>
        `,
        validator: `
            <h2>How to Use This Tool</h2>
            <p>Working with JSON is straightforward with our browser-based tool:</p>
            <ol>
                <li><strong>Paste or upload:</strong> Paste your JSON directly or upload a JSON file.</li>
                <li><strong>Automatic processing:</strong> The tool instantly formats, validates, or processes your JSON based on the selected operation.</li>
                <li><strong>View results:</strong> See beautifully formatted JSON with syntax highlighting and any validation errors clearly marked.</li>
                <li><strong>Copy or download:</strong> Copy the result to your clipboard or download as a file.</li>
            </ol>
            <p>All JSON processing happens in your browser using JavaScript. Your data never touches our servers, ensuring complete privacy for sensitive configuration files, API responses, or any JSON data.</p>
        `,
        "use-case": `
            <h2>Why Use These Tools?</h2>
            <p>Our collection of browser-based utilities offers several key advantages:</p>
            <ol>
                <li><strong>Complete Privacy:</strong> All processing happens in your browser. Files never upload to servers.</li>
                <li><strong>No Installation:</strong> Access instantly from any device with a web browser. No downloads or software to install.</li>
                <li><strong>Always Free:</strong> No usage limits, no subscriptions, no hidden costs. Use these tools as much as you need.</li>
                <li><strong>Fast Processing:</strong> Client-side processing means no upload/download delays. Conversions happen instantly.</li>
            </ol>
            <p>Whether you're a developer, designer, content creator, or just need to convert files occasionally, these tools provide professional-grade functionality without compromising your privacy or requiring any setup.</p>
        `
    };

    return {
        title: "How It Works",
        content: templates[variant.searchIntent],
        type: "howto"
    };
}

/**
 * Generate use cases section
 */
export function generateUseCasesSection(variant: KeywordVariant): ContentSection {
    const useCases = variant.uniqueContent.useCases;
    
    return {
        title: "Common Use Cases",
        content: `
            <h2>When to Use ${variant.h1}</h2>
            <p>This tool is perfect for a variety of scenarios:</p>
            <ul>
                ${useCases.map(useCase => `<li><strong>${useCase}</strong></li>`).join("\n                ")}
            </ul>
            <p>${variant.uniqueContent.helpText}</p>
        `,
        type: "usecases"
    };
}

/**
 * Generate privacy/security section
 */
export function generatePrivacySection(variant: KeywordVariant): ContentSection {
    const templates = {
        image: "images",
        json: "JSON data",
        csv: "data files",
        general: "files"
    };

    const fileType = variant.targetFormat 
        ? (variant.targetFormat.some(f => ["png", "jpg", "jpeg", "webp", "avif", "heic", "gif", "svg", "bmp", "ico"].includes(f.toLowerCase())) ? "images" : "files")
        : (variant.primaryKeyword.includes("json") ? "JSON data" : "files");

    return {
        title: "Why Privacy Matters",
        content: `
            <h2>Your Privacy is Protected</h2>
            <p>Unlike many online tools, we take your privacy seriously. Here's what makes our approach different:</p>
            <div class="privacy-features">
                <div class="feature">
                    <h3>No Server Uploads</h3>
                    <p>Your ${fileType} are processed entirely in your browser using JavaScript. They never travel to our servers or anyone else's.</p>
                </div>
                <div class="feature">
                    <h3>Zero Data Collection</h3>
                    <p>We don't collect, store, or analyze your ${fileType}. We have no idea what you're working on—and we like it that way.</p>
                </div>
                <div class="feature">
                    <h3>Works Offline</h3>
                    <p>Once the page loads, you can disconnect from the internet. All processing happens locally on your device.</p>
                </div>
                <div class="feature">
                    <h3>Open Source Approach</h3>
                    <p>Our client-side processing approach is transparent. You can verify that nothing leaves your browser.</p>
                </div>
            </div>
            <p>This privacy-first approach makes our tools ideal for sensitive documents, confidential business data, personal photos, or any situation where data security is important. Use these tools with confidence knowing your ${fileType} remain completely private.</p>
        `,
        type: "privacy"
    };
}

/**
 * Generate FAQs based on variant type
 */
export function generateFAQs(variant: KeywordVariant): Array<{ question: string; answer: string }> {
    const baseFAQs = {
        converter: [
            {
                question: `Is the ${variant.h1} really free?`,
                answer: `Yes, absolutely! Our ${variant.h1} is completely free with no hidden costs, no usage limits, and no account required. Convert as many files as you need, whenever you need.`
            },
            {
                question: "Are my files uploaded to your servers?",
                answer: `No, never. All conversion happens in your browser using JavaScript. Your files are processed locally on your device and never leave it. This ensures complete privacy and security.`
            },
            {
                question: `What file sizes can the ${variant.h1} handle?`,
                answer: `The tool can handle files of any reasonable size. Since processing happens in your browser, the limit is based on your device's available memory. Most users can easily process files up to several hundred megabytes.`
            },
            {
                question: "Do I need to install any software?",
                answer: `No installation needed! The tool works entirely in your web browser. Just open the page and start converting. It works on any device with a modern browser—desktop, laptop, tablet, or phone.`
            },
            {
                question: `Can I convert multiple files at once?`,
                answer: `Yes! The tool supports batch conversion, allowing you to convert multiple files simultaneously. This is perfect for processing entire folders or image libraries.`
            }
        ],
        compressor: [
            {
                question: "How much can I reduce my image file size?",
                answer: `File size reduction depends on the original image and target size. Typically, you can reduce JPG files by 60-80% and PNG files by 40-70% without visible quality loss. Our intelligent algorithms find the optimal balance automatically.`
            },
            {
                question: "Will compressing reduce image quality?",
                answer: `Our compression algorithms are designed to maintain visual quality while reducing file size. For most use cases, quality differences are imperceptible. You can always preview results and adjust settings before downloading.`
            },
            {
                question: "Are my images uploaded to your servers?",
                answer: `No, absolutely not. All image compression happens in your browser. Your images are processed locally on your device and never leave it, ensuring complete privacy for your photos and graphics.`
            },
            {
                question: "Can I compress multiple images at once?",
                answer: `Yes! The compressor supports batch processing, allowing you to compress dozens or hundreds of images simultaneously with consistent settings.`
            },
            {
                question: "What image formats are supported?",
                answer: `The compressor supports all major image formats including JPG/JPEG, PNG, WebP, AVIF, GIF, and more. Different formats use different optimization techniques for best results.`
            }
        ],
        validator: [
            {
                question: "Is my JSON data private?",
                answer: `Yes, completely private. All JSON processing happens in your browser using JavaScript. Your data never leaves your device and is never sent to our servers or anyone else's.`
            },
            {
                question: "Can this tool handle large JSON files?",
                answer: `Yes! The tool is optimized to handle large JSON files efficiently, typically processing files of 100MB or more without issues. Processing happens locally using your device's resources.`
            },
            {
                question: "Does the tool validate JSON syntax?",
                answer: `Yes, JSON is automatically validated. Any syntax errors are highlighted with detailed error messages showing exactly what's wrong and where, making it easy to fix issues quickly.`
            },
            {
                question: "Can I use this tool offline?",
                answer: `Yes! Once the page loads, you can disconnect from the internet. All JSON processing happens locally in your browser, so no internet connection is required for the actual work.`
            },
            {
                question: "Is this tool really free?",
                answer: `Yes, completely free with no usage limits, no accounts required, and no hidden costs. Use it as much as you need for personal or commercial projects.`
            }
        ],
        "use-case": [
            {
                question: "Do these tools really work offline?",
                answer: `Yes! Once a tool page loads, you can disconnect from the internet. All processing happens in your browser using JavaScript, so no internet connection is needed for the actual work.`
            },
            {
                question: "Are these tools really free?",
                answer: `Yes, completely free. No trials, no premium tiers, no usage limits, no hidden costs. All tools are free forever for both personal and commercial use.`
            },
            {
                question: "Why don't you upload files to servers?",
                answer: `Client-side processing offers three major advantages: complete privacy for your data, instant processing with no upload delays, and the ability to work offline. Your files never leave your device.`
            },
            {
                question: "What browsers are supported?",
                answer: `All modern browsers are supported including Chrome, Firefox, Safari, Edge, and others. The tools use standard web technologies that work across all platforms and devices.`
            },
            {
                question: "Can I use these tools for commercial projects?",
                answer: `Yes! All tools are free for both personal and commercial use. No attribution required, no licenses to buy, no usage restrictions.`
            }
        ]
    };

    return baseFAQs[variant.searchIntent] || baseFAQs.converter;
}

/**
 * Generate benefits/features section
 */
export function generateBenefitsSection(variant: KeywordVariant): ContentSection {
    return {
        title: "Key Benefits",
        content: `
            <h2>Why Choose Our ${variant.h1}</h2>
            <div class="benefits-grid">
                <div class="benefit">
                    <h3 class="benefit-title">Complete Privacy</h3>
                    <p>Files processed in your browser never touch our servers. Your data stays on your device.</p>
                </div>
                <div class="benefit">
                    <h3 class="benefit-title">Lightning Fast</h3>
                    <p>No upload or download delays. Processing happens instantly using your device's power.</p>
                </div>
                <div class="benefit">
                    <h3 class="benefit-title">Always Free</h3>
                    <p>No usage limits, no accounts, no subscriptions. Free forever for unlimited use.</p>
                </div>
                <div class="benefit">
                    <h3 class="benefit-title">Works Everywhere</h3>
                    <p>Use on any device with a browser. No installation, downloads, or special software needed.</p>
                </div>
                <div class="benefit">
                    <h3 class="benefit-title">Mobile Friendly</h3>
                    <p>Fully responsive design works perfectly on phones and tablets, not just desktops.</p>
                </div>
                <div class="benefit">
                    <h3 class="benefit-title">Offline Capable</h3>
                    <p>Once loaded, disconnect from the internet. All processing works completely offline.</p>
                </div>
            </div>
        `,
        type: "benefits"
    };
}

/**
 * Generate complete page content for a variant
 */
export function generatePageContent(variant: KeywordVariant): {
    sections: ContentSection[];
    faqs: Array<{ question: string; answer: string }>;
} {
    return {
        sections: [
            generateIntroSection(variant),
            generateBenefitsSection(variant),
            generateHowItWorksSection(variant),
            generateUseCasesSection(variant),
            generatePrivacySection(variant)
        ],
        faqs: generateFAQs(variant)
    };
}

/**
 * Helper to generate breadcrumbs for a variant page
 */
export function generateBreadcrumbs(variant: KeywordVariant) {
    const breadcrumbs = [
        { name: "Home", path: "/" },
        { name: "Tools", path: "/tools" }
    ];

    // Add parent tool if exists
    if (variant.parentTool && variant.parentTool !== "tools") {
        const toolName = variant.parentTool
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        breadcrumbs.push({
            name: toolName,
            path: `/${variant.parentTool}`
        });
    }

    // Add current page
    breadcrumbs.push({
        name: variant.h1,
        path: `/${variant.slug}`
    });

    return breadcrumbs;
}
