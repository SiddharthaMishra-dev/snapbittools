import type { ReactNode } from "react";

import PageShell from "@/components/PageShell";

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <PageShell>
      <article className="pt-28 pb-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-theme-heading tracking-tight mb-3">{title}</h1>
          <p className="text-sm text-theme-muted mb-10">Last updated {updated}</p>
          <div className="space-y-8 text-sm md:text-base text-theme-body leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-theme-heading [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-brand-primary [&_a]:hover:text-brand-hover [&_code]:font-mono [&_code]:text-xs [&_code]:bg-theme-code-bg [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
            {children}
          </div>
        </div>
      </article>
    </PageShell>
  );
}
