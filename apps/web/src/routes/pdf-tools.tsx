import { createFileRoute } from "@tanstack/react-router";

import { CategoryToolsPage, categoryPageHead } from "@/components/CategoryToolsPage";

export const Route = createFileRoute("/pdf-tools")({
  head: () => categoryPageHead("PDF"),
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryToolsPage category="PDF" />;
}
