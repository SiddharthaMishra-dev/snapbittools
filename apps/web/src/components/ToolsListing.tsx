import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { TOOL_CATEGORY_ORDER, getToolsByCategory, toolCategories, type ToolCategory, type ToolDefinition } from "@/data/tools";

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon;

  return (
    <Link
      to={tool.href}
      className="group relative flex items-start gap-4 p-5 rounded-xl border border-theme-border bg-theme-card hover:border-brand-primary/40 hover:shadow-md transition-all duration-200 no-underline theme-card-hover"
    >
      <div className="w-11 h-11 rounded-lg bg-linear-to-b from-brand-primary to-brand-hover ring-2 ring-brand-primary/80 shadow-lg flex items-center justify-center shrink-0 group-hover:bg-brand-hover transition-colors">
        <Icon className="text-white" size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-theme-heading group-hover:text-brand-primary transition-colors truncate">
            {tool.name}
          </h3>
          {tool.isNew && <span className="shrink-0 text-[10px] font-bold bg-brand-primary text-white px-1.5 py-0.5 rounded-full">NEW</span>}
        </div>
        <p className="text-xs text-theme-muted mt-0.5 leading-relaxed line-clamp-2">{tool.description}</p>
        <span className="mt-2 inline-flex items-center text-xs text-brand-primary font-medium gap-0.5">
          Try it
          <IconChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </span>
      </div>
    </Link>
  );
}

export function ToolsGrid({ items }: { items: ToolDefinition[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}

type ToolsListingProps = {
  category?: ToolCategory;
};

export function ToolsListing({ category }: ToolsListingProps) {
  if (category) {
    return (
      <main className="flex-1 px-4 pb-16 relative z-10 bg-theme-page">
        <div className="max-w-7xl mx-auto">
          <ToolsGrid items={getToolsByCategory(category)} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 pb-16 relative z-10 bg-theme-page">
      <div className="max-w-7xl mx-auto space-y-12">
        {TOOL_CATEGORY_ORDER.map((section) => {
          const meta = toolCategories[section];
          const categoryTools = getToolsByCategory(section);
          if (categoryTools.length === 0) return null;

          return (
            <section key={section} id={meta.id} className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-theme-heading">{meta.heading}</h2>
                  <p className="text-sm text-theme-muted mt-1">{meta.description}</p>
                </div>
                <Link
                  to={meta.href}
                  className="text-sm text-brand-primary font-semibold hover:text-brand-hover flex items-center gap-1 no-underline"
                >
                  View {meta.navLabel.toLowerCase()} tools
                  <IconChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <ToolsGrid items={categoryTools} />
            </section>
          );
        })}
      </div>
    </main>
  );
}
