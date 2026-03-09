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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-8 px-4 flex flex-col items-center">
            <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
                <section className="text-center mb-12 max-w-5xl mx-auto w-full">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-100">{variant.h1}</h1>

                    <div
                        className="text-md text-gray-400 mb-8 prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sections[0].content }}
                    />
                </section>

                <section className="mb-16 w-full">
                    <ToolComponent />
                </section>

                <section className="mb-16 w-full">
                    <div className="max-w-4xl mx-auto px-8 py-10 bg-gradient-to-br from-gray-900/40 to-gray-900/20 rounded-xl border border-gray-700/40 backdrop-blur-sm hover:border-gray-600/60 transition-all duration-300">
                        <div
                            className="prose prose-lg prose-invert max-w-none text-gray-100 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-50 [&_h2]:mb-4 [&_ul]:space-y-3 [&_li]:text-gray-200"
                            dangerouslySetInnerHTML={{ __html: sections[1].content }}
                        />
                    </div>
                </section>

                <section className="mb-16 w-full">
                    <div className="max-w-4xl mx-auto px-8 py-10 bg-gradient-to-br from-blue-900/20 to-gray-900/30 rounded-xl border border-blue-500/30 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                        <div
                            className="prose prose-lg prose-invert max-w-none text-gray-100 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-blue-200 [&_h2]:mb-4 [&_ol]:space-y-3 [&_li]:text-gray-200"
                            dangerouslySetInnerHTML={{ __html: sections[2].content }}
                        />
                    </div>
                </section>

                <section className="mb-16 w-full">
                    <div className="max-w-4xl mx-auto px-8 py-10 bg-gradient-to-br from-gray-900/40 to-gray-900/20 rounded-xl border border-gray-700/40 backdrop-blur-sm hover:border-gray-600/60 transition-all duration-300">
                        <div
                            className="prose prose-lg prose-invert max-w-none text-gray-100 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-50 [&_h2]:mb-4 [&_ul]:space-y-3 [&_li]:text-gray-200"
                            dangerouslySetInnerHTML={{ __html: sections[3].content }}
                        />
                    </div>
                </section>
                <section className="mb-16 w-full">
                    <div className="max-w-4xl mx-auto px-8 py-10 bg-gradient-to-br from-emerald-900/20 to-gray-900/30 rounded-xl border border-emerald-500/30 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300">
                        <div
                            className="prose prose-lg prose-invert max-w-none text-gray-100 privacy-section [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-emerald-200 [&_h2]:mb-4 [&_ul]:space-y-3 [&_li]:text-gray-200"
                            dangerouslySetInnerHTML={{ __html: sections[4].content }}
                        />
                    </div>
                </section>
                <section className="mb-16 w-full">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center text-gray-100">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <details
                                    key={index}
                                    className="group bg-gray-900/40 border border-gray-700/50 rounded-lg p-6 cursor-pointer hover:border-blue-500/50 hover:bg-gray-900/60 transition-all duration-200"
                                >
                                    <summary className="font-semibold text-lg flex items-center justify-between text-gray-100 cursor-pointer">
                                        {faq.question}
                                        <IconChevronDown className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-transform duration-300 " />
                                    </summary>
                                    <p className="mt-4 text-gray-300 leading-relaxed">{faq.answer}</p>
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
