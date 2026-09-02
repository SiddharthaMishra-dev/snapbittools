import { createFileRoute } from "@tanstack/react-router";

import { CategoryToolsPage, categoryPageHead } from "@/components/CategoryToolsPage";

export const Route = createFileRoute("/utility-tools")({
  head: () => categoryPageHead("Utility"),
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryToolsPage category="Utility" />;
}
