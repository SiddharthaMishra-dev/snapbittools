import { Link, useMatches } from "@tanstack/react-router";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { tools } from "@/data/tools";

interface BreadcrumbItem {
  label: string;
  path: string;
}

export default function Breadcrumbs() {
  const matches = useMatches();

  const currentPath = matches[matches.length - 1]?.pathname || "/";

  // Don't show breadcrumbs on home page
  if (currentPath === "/") {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

  // Split path and build breadcrumbs
  const pathSegments = currentPath.split("/").filter(Boolean);

  pathSegments.forEach((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");

    // Find tool name from tools data
    const tool = tools.find((t) => t.slug === segment);
    const label = tool
      ? tool.name
      : segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

    breadcrumbs.push({ label, path });
  });

  return (
    <nav className="" aria-label="Breadcrumb">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li key={crumb.path} className="flex items-center">
                {index > 0 && <IconChevronRight className="w-4 h-4 mx-2 text-slate-600" aria-hidden="true" />}

                {isLast ? (
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    {isFirst && <IconHome className="w-4 h-4" />}
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 hover:underline"
                  >
                    {isFirst && <IconHome className="w-4 h-4" />}
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
