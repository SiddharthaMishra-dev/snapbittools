import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import GlowCard from "@/components/ui/GlowCard";
import type { ToolDefinition } from "@/data/tools";
import { tools } from "@/data/tools";

const toolsByCategory = tools.reduce<Record<string, ToolDefinition[]>>((acc, tool) => {
  if (!acc[tool.category]) acc[tool.category] = [];
  acc[tool.category].push(tool);
  return acc;
}, {});

export function ToolsListing() {
  return (
    <main className="flex-1 px-4 pb-16 relative z-10 bg-theme-page">
      <div className="max-w-7xl mx-auto space-y-12">
        {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <section key={category} id={category.toLowerCase()} className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
              <div>
                <h2 className="text-2xl font-bold text-theme-heading">{category} tools</h2>
                <p className="text-sm text-theme-muted mt-1">
                  Click any tool to open it instantly — no signup needed.
                </p>
              </div>
              <a
                href="#top"
                className="text-sm text-brand-primary font-semibold hover:text-brand-hover flex items-center gap-1 no-underline"
              >
                Back to top
                <IconChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.slug}
                    to={tool.href}
                    className="group relative flex items-start gap-4 p-5 rounded-xl border border-theme-border bg-theme-card hover:border-brand-primary/40 hover:shadow-md transition-all duration-200 no-underline theme-card-hover"
                  >
                    <div className="w-11 h-11 rounded-lg bg-theme-icon-bg flex items-center justify-center shrink-0 group-hover:bg-theme-icon-bg-hover transition-colors">
                      <Icon className="text-brand-primary" size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-theme-heading group-hover:text-brand-primary transition-colors truncate">
                          {tool.name}
                        </h3>
                        {tool.isNew && (
                          <span className="shrink-0 text-[10px] font-bold bg-brand-primary text-white px-1.5 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-theme-muted mt-0.5 leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                      <span className="mt-2 inline-flex items-center text-xs text-brand-primary font-medium gap-0.5">
                        Try it
                        <IconChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
