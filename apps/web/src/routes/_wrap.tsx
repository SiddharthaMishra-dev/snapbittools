import Sidebar from "@/components/Sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_wrap")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-theme-page flex min-h-screen pt-16">
      <Sidebar />
      <div className="mt-2 sm:mt-0 flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
