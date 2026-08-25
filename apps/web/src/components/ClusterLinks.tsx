import { Link } from "@tanstack/react-router";
import { IconChevronRight } from "@tabler/icons-react";

import type { ClusterLink } from "@/lib/internal-linking";

type ClusterLinksProps = {
  heading: string;
  links: ClusterLink[];
};

export default function ClusterLinks({ heading, links }: ClusterLinksProps) {
  if (links.length === 0) return null;

  return (
    <section className="mt-12 mx-auto w-full max-w-7xl">
      <h2 className="text-2xl font-bold text-theme-heading mb-6">{heading}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 m-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="group flex items-center gap-3 p-4 rounded-lg border border-[var(--theme-related-card-border)] bg-[var(--theme-related-card-bg)] hover:bg-[var(--theme-related-card-hover-bg)] hover:border-brand-primary/50 transition-colors duration-200 no-underline"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-theme-heading group-hover:text-brand-primary transition-colors">{link.name}</h3>
                <p className="text-xs text-theme-muted mt-1 leading-relaxed line-clamp-2">{link.description}</p>
              </div>
              <IconChevronRight className="w-5 h-5 text-theme-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
