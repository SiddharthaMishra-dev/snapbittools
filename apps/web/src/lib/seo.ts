export type SeoMetadata = {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image?: string;
  type?: "website" | "software";
  faqs?: { question: string; answer: string }[];
};

export function getSeoMetadata(config: SeoMetadata) {
  const {
    title,
    description,
    keywords,
    url,
    image = "https://js-devtools.sidme.dev/screenshot.png",
    type = "website",   
    faqs,
  } = config;

  const baseUrl = "https://js-devtools.sidme.dev";
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
    applicationCategory:
      type === "software" ? "DeveloperApplication, MultimediaApplication" : undefined,
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

  return {
    meta,
    links: [{ rel: "canonical", href: fullUrl }],
    scripts,
  };
}
