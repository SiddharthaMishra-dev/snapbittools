/**
 * pSEO Page Component
 *
 * Reusable component for rendering programmatic SEO pages.
 * Takes keyword variant data and renders a complete, SEO-optimized page.
 */

import { type KeywordVariant } from "@/data/pseo-keywords";
import { generatePageContent } from "@/lib/pseo-templates";
import RelatedTools from "@/components/RelatedTools";
import { IconChevronDown } from "@tabler/icons-react";

interface PseoPageProps {
  variant: KeywordVariant;
  toolComponent: React.ComponentType;
}

export default function PseoPage({ variant, toolComponent: ToolComponent }: PseoPageProps) {
  const { sections, faqs } = generatePageContent(variant);

  return (
    <div className="min-h-screen py-2 px-4 flex flex-col items-center bg-theme-page text-theme-heading">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <section className="text-center mb-12 max-w-5xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-theme-heading">{variant.h1}</h1>

          <div
            className="text-md text-theme-muted mb-8 prose max-w-none [&_a]:text-brand-primary"
            dangerouslySetInnerHTML={{ __html: sections[0].content }}
          />
        </section>

        <section className="mb-16 w-full">
          <ToolComponent />
        </section>

        <section className="mb-16 w-full">
          <div className="max-w-7xl mx-auto px-8 py-10 theme-pseo-panel rounded-xl backdrop-blur-sm hover:border-brand-primary/20 transition-all duration-300">
            <div
              className="prose prose-lg max-w-none text-theme-body [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-theme-heading [&_h2]:mb-4 [&_ul]:space-y-3 [&_li]:text-theme-body"
              dangerouslySetInnerHTML={{ __html: sections[1].content }}
            />
          </div>
        </section>

        <section className="mb-16 w-full">
          <div className="max-w-7xl mx-auto px-8 py-10 theme-pseo-accent-panel rounded-xl backdrop-blur-sm hover:border-brand-primary/30 transition-all duration-300">
            <div
              className="prose prose-lg max-w-none text-theme-body [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--theme-pseo-accent-heading)] [&_h2]:mb-4 [&_ol]:space-y-3 [&_li]:text-theme-body"
              dangerouslySetInnerHTML={{ __html: sections[2].content }}
            />
          </div>
        </section>

        <section className="mb-16 w-full">
          <div className="max-w-7xl mx-auto px-8 py-10 theme-pseo-panel rounded-xl backdrop-blur-sm hover:border-brand-primary/20 transition-all duration-300">
            <div
              className="prose prose-lg max-w-none text-theme-body [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-theme-heading [&_h2]:mb-4 [&_ul]:space-y-3 [&_li]:text-theme-body"
              dangerouslySetInnerHTML={{ __html: sections[3].content }}
            />
          </div>
        </section>
        <section className="mb-16 w-full">
          <div className="max-w-7xl mx-auto px-8 py-10 theme-pseo-emerald-panel rounded-xl backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
            <div
              className="prose prose-lg max-w-none text-theme-body privacy-section [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--theme-pseo-emerald-heading)] [&_h2]:mb-4 [&_ul]:space-y-3 [&_li]:text-theme-body"
              dangerouslySetInnerHTML={{ __html: sections[4].content }}
            />
          </div>
        </section>
        <section className="mb-16 w-full">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-theme-heading">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group theme-panel rounded-lg p-6 cursor-pointer hover:border-brand-primary/30 transition-all duration-200"
                >
                  <summary className="font-semibold text-lg flex items-center justify-between text-theme-heading cursor-pointer">
                    {faq.question}
                    <IconChevronDown className="w-5 h-5 text-theme-muted group-hover:text-brand-primary transition-transform duration-300" />
                  </summary>
                  <p className="mt-4 text-theme-body leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full">
          <RelatedTools currentToolSlug={variant.parentTool} />
        </section>
      </div>
    </div>
  );
}
