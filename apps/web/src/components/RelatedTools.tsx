import { Link } from "@tanstack/react-router";
import { IconChevronRight } from "@tabler/icons-react";
import { toolCategories, tools, type ToolCategory, type ToolDefinition } from "@/data/tools";

interface RelatedToolsProps {
  currentToolSlug: string;
  category?: ToolCategory | "all";
  maxTools?: number;
}

export default function RelatedTools({ currentToolSlug, category = "all", maxTools = 4 }: RelatedToolsProps) {
  let relatedTools = tools.filter((tool) => tool.slug !== currentToolSlug);

  if (category !== "all") {
    const sameCategory = relatedTools.filter((tool) => tool.category === category);
    const otherCategory = relatedTools.filter((tool) => tool.category !== category);
    relatedTools = [...sameCategory, ...otherCategory];
  }

  relatedTools = relatedTools.slice(0, maxTools);

  if (relatedTools.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mx-auto w-full max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-theme-heading">
            {category !== "all" ? `Other ${toolCategories[category].heading}` : "More Tools You Might Need"}
          </h2>
        </div>
        <Link
          to={category !== "all" ? toolCategories[category].href : "/tools"}
          className="hidden sm:inline-flex items-center gap-2 text-sm text-brand-primary font-semibold hover:text-brand-hover transition-colors"
        >
          {category !== "all" ? `View ${toolCategories[category].heading}` : "View all tools"}
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {relatedTools.map((tool) => (
          <RelatedToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      <Link
        to={category !== "all" ? toolCategories[category].href : "/tools"}
        className="sm:hidden mt-4 inline-flex items-center gap-2 text-sm text-brand-primary font-semibold hover:text-brand-hover transition-colors"
      >
        {category !== "all" ? `View ${toolCategories[category].heading}` : "View all tools"}
        <IconChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function RelatedToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon;

  return (
    <Link
      to={tool.href}
      className="group flex items-center gap-3 p-4 rounded-lg border border-[var(--theme-related-card-border)] bg-[var(--theme-related-card-bg)] hover:bg-[var(--theme-related-card-hover-bg)] hover:border-brand-primary/50 transition-all duration-200"
    >
      <div className="shrink-0 w-11 h-11 bg-linear-to-b from-red-500 to-red-600 ring-2 ring-red-500/80 shadow-lg rounded-lg flex items-center justify-center group-hover:bg-brand-primary transition-colors">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-theme-heading group-hover:text-brand-primary transition-colors">{tool.name}</h3>
      </div>
      <IconChevronRight className="w-5 h-5 text-theme-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
    </Link>
  );
}
