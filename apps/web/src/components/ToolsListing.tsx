import { IconChevronRight } from "@tabler/icons-react";

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
    <main className="flex-1 px-4 pb-16 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <section
            key={category}
            id={category.toLowerCase()}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-gray-100">{category} tools</h2>
                <p className="text-sm text-gray-300">
                  Optimized copy and internal links help each tool page index cleanly.
                </p>
              </div>
              <a
                href="#top"
                className="text-sm text-brand-primary font-semibold hover:text-brand-hover flex items-center gap-1"
              >
                Back to top
                <IconChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <GlowCard
                    key={tool.slug}
                    to={tool.href}
                    isNew={tool.isNew}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-brand-dark rounded-lg flex items-center justify-center group-hover:bg-brand-primary transition-colors ease-in-out">
                          <Icon className="text-brand-light" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-300 mb-2 group-hover:text-brand-primary transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-gray-200 text-sm leading-relaxed">{tool.description}</p>

                        <div className="mt-4 flex items-center text-brand-primary text-sm font-medium">
                          <span>Try Now</span>
                          <IconChevronRight className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
