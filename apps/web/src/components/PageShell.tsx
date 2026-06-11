import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  withDotGrid?: boolean;
  id?: string;
};

export default function PageShell({ children, className, withDotGrid = true, id }: PageShellProps) {
  return (
    <div id={id} className={cn("min-h-screen flex flex-col font-sans bg-theme-page text-theme-heading relative", className)}>
      {withDotGrid && <div className="theme-dot-grid pointer-events-none fixed inset-0 z-0" aria-hidden="true" />}
      {children}
    </div>
  );
}
