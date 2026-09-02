import { createFileRoute } from "@tanstack/react-router";

import { CategoryToolsPage, categoryPageHead } from "@/components/CategoryToolsPage";

export const Route = createFileRoute("/image-tools")({
  head: () => categoryPageHead("Images"),
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryToolsPage category="Images" />;
}
