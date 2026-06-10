// import Header from '@/components/Header'
// import { IconMenu } from '@tabler/icons-react'
import Sidebar from "@/components/Sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_wrap")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-white flex">
      <Sidebar />
      <div className="mt-8 sm:mt-0 flex-1 h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
