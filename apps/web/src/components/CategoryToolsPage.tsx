import { createLink } from "@tanstack/react-router";

import PageShell from "@/components/PageShell";
import { ToolsListing } from "@/components/ToolsListing";
import Button from "@/components/ui/button";
import { toolCategories, type ToolCategory } from "@/data/tools";
import { getSeoMetadata } from "@/lib/seo";

export function categoryPageHead(category: ToolCategory) {
  const meta = toolCategories[category];
  return getSeoMetadata({
    title: meta.seoTitle,
    description: meta.seoDescription,
    keywords: meta.keywords,
    url: meta.href,
  });
}

export function CategoryToolsPage({ category }: { category: ToolCategory }) {
  const meta = toolCategories[category];
  const ButtonLink = createLink(Button);

  return (
    <PageShell id="top">
      <section className="relative z-10 pt-28 pb-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-theme-heading mb-6 tracking-tight">
            <span className="text-brand-primary">{meta.heading.replace(/ tools$/i, "")}</span> tools
          </h1>
          <p className="text-base md:text-lg text-theme-muted max-w-3xl mx-auto mb-8 leading-relaxed">{meta.description}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <ButtonLink
              to="/tools"
              className="px-6 py-2.5 border border-theme-border bg-theme-surface text-theme-body rounded-xl text-sm font-semibold hover:bg-theme-surface-muted transition-colors"
            >
              All tools
            </ButtonLink>
          </div>
        </div>
      </section>

      <ToolsListing category={category} />
    </PageShell>
  );
}
