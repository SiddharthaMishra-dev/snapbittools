import SiteFooter from "@/components/SiteFooter";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_wrap")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-theme-page flex min-h-screen flex-col pt-16">
      <Outlet />
      <SiteFooter />
    </div>
  );
}
