import { createFileRoute } from "@tanstack/react-router";

import { CategoryToolsPage, categoryPageHead } from "@/components/CategoryToolsPage";

export const Route = createFileRoute("/data-tools")({
  head: () => categoryPageHead("Data"),
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryToolsPage category="Data" />;
}
