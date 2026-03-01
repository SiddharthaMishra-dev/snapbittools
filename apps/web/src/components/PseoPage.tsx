/**
 * pSEO Page Component
 *
 * Reusable component for rendering programmatic SEO pages.
 * Takes keyword variant data and renders a complete, SEO-optimized page.
 */

import { type KeywordVariant } from "@/data/pseo-keywords";
import { generatePageContent, generateBreadcrumbs } from "@/lib/pseo-templates";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedTools from "@/components/RelatedTools";

interface PseoPageProps {
  variant: KeywordVariant;
  toolComponent: React.ComponentType;
}

export default function PseoPage({ variant, toolComponent: ToolComponent }: PseoPageProps) {
  const { sections, faqs } = generatePageContent(variant);
  const breadcrumbs = generateBreadcrumbs(variant);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-8">
        {/* TODO: Update Breadcrumbs component to accept items prop */}
        {/* <Breadcrumbs items={breadcrumbs.map(b => ({ label: b.name, href: b.path }))} /> */}
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {variant.h1}
          </h1>

          {/* Intro Content */}
          <div
            className="text-lg text-muted-foreground mb-8 text-left"
            dangerouslySetInnerHTML={{ __html: sections[0].content }}
          />
        </div>
      </section>

      {/* Tool Component */}
      <section className="container mx-auto px-4 py-8">
        <ToolComponent />
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sections[1].content }}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12 bg-muted/30 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sections[2].content }}
          />
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sections[3].content }}
          />
        </div>
      </section>

      {/* Privacy Section */}
      <section className="container mx-auto px-4 py-12 bg-muted/30 rounded-lg">
        <div className="max-w-6xl mx-auto">
          <div
            className="prose prose-lg max-w-none dark:prose-invert privacy-section"
            dangerouslySetInnerHTML={{ __html: sections[4].content }}
          />
        </div>
      </section>

      {/* FAQs Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <summary className="font-semibold text-lg flex items-center justify-between">
                  {faq.question}
                  <span className="ml-4 text-muted-foreground group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Tools Section */}
      <section className="container mx-auto px-4 py-12">
        <RelatedTools currentToolSlug={variant.parentTool} />
      </section>
    </div>
  );
}
