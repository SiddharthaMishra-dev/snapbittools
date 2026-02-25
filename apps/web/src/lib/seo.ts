export type Breadcrumb = {
    name: string;
    path: string;
};

export type SeoMetadata = {
    title: string;
    description: string;
    keywords: string[];
    url: string;
    image?: string;
    type?: "website" | "software";
    faqs?: { question: string; answer: string }[];
    breadcrumbs?: Breadcrumb[];
    schema?: Record<string, any>;
};

export function getSeoMetadata(config: SeoMetadata) {
    const { 
        title, 
        description, 
        keywords, 
        url, 
        image = "https://snapbittools.com/screenshot.png", 
        type = "website", 
        faqs,
        breadcrumbs,
        schema,
    } = config;

    const baseUrl = "https://snapbittools.com";
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    const meta: any[] = [
        { title: title },
        { name: "description", content: description },
        { name: "keywords", content: keywords.join(", ") },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: fullUrl },
        { property: "og:image", content: image },
        { property: "og:type", content: type === "software" ? "website" : type },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "robots", content: "index,follow" },
    ];

    const scripts: any[] = [];

    const mainSchema = {
        "@context": "https://schema.org",
        "@type": type === "software" ? "SoftwareApplication" : "WebSite",
        name: title,
        description: description,
        url: fullUrl,
        applicationCategory: type === "software" ? "DeveloperApplication, MultimediaApplication" : undefined,
        operatingSystem: type === "software" ? "Any" : undefined,
        offers:
            type === "software"
                ? {
                      "@type": "Offer",
                      price: "0",
                      priceCurrency: "USD",
                  }
                : undefined,
        author: {
            "@type": "Person",
            name: "Siddhartha Mishra",
            url: "https://sidme.dev/",
        },
    };

    scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(mainSchema),
    });

    if (faqs && faqs.length > 0) {
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: f.answer,
                },
            })),
        };
        scripts.push({
            type: "application/ld+json",
            children: JSON.stringify(faqSchema),
        });
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: crumb.name,
                item: crumb.path.startsWith("http") ? crumb.path : `${baseUrl}${crumb.path}`,
            })),
        };
        scripts.push({
            type: "application/ld+json",
            children: JSON.stringify(breadcrumbSchema),
        });
    }

    if (schema) {
        scripts.push({
            type: "application/ld+json",
            children: JSON.stringify(schema),
        });
    }

    return {
        meta,
        links: [{ rel: "canonical", href: fullUrl }],
        scripts,
    };
}

export function getOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "SnapBit Tools",
        url: "https://snapbittools.com",
        logo: "https://snapbittools.com/logo.png",
        description: "Free, private, and fast browser-based utility tools for developers, designers, and content creators",
        sameAs: [
            "https://github.com/SiddharthaMishra-dev/js-dev-tools",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "General",
            url: "https://snapbittools.com",
        },
        areaServed: "Worldwide",
        availableLanguage: "English",
    };
}
