import { tools } from "@/data/tools";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar";
import { IconLink } from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "motion/react";
import { blogPosts } from "@/data/blogs";

export default function Sidebar() {
  const { isOpen, isMobile, isSidebarRoute, closeSidebar } = useSidebar();
  const current_path = useLocation().pathname;

  if (!isSidebarRoute) return null;

  return (
    <>
      {isMobile && isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={closeSidebar}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <motion.div
        className={cn(
          "shrink-0 border-r border-theme-sidebar-border text-theme-sidebar-text overflow-hidden transition-all duration-300 w-64 py-4 px-2 overflow-y-auto no-scrollbar bg-theme-sidebar-bg",
          isOpen ? "ml-0" : "-ml-64",
          isMobile
            ? "fixed top-16 left-0 h-[calc(100vh-4rem)] z-20"
            : "relative h-[calc(100vh-4rem)]",
        )}
      >
        <h2 className="text-theme-sidebar-heading text-sm font-semibold mb-2 px-2">Tools</h2>
        <div className="flex flex-col items-center justify-between gap-y-2 mb-4">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              to={tool.href}
              className={cn(
                "group px-2 py-1 flex text-theme-sidebar-text shrink-0 w-full justify-start bg-transparent rounded-lg text-sm",
                current_path === tool.href &&
                  "bg-theme-sidebar-active text-theme-sidebar-active-text font-semibold",
              )}
              activeOptions={{ exact: true }}
            >
              <IconLink
                size={16}
                className="w-0 mr-2 group-hover:w-4 transition-all duration-150"
              />
              {tool.name}
            </Link>
          ))}
        </div>

        <div className="mt-4">
          <h2 className="text-theme-sidebar-heading text-sm font-semibold mb-2 px-2">Blogs</h2>
          <div className="flex flex-col items-center justify-between gap-y-0.5 mb-4">
            {blogPosts.map((post) => (
              <Link
                key={post.href}
                to={post.href}
                className={cn(
                  "px-1 py-1 flex text-theme-muted shrink-0 w-full justify-start bg-transparent rounded-lg text-sm mb-2",
                  current_path === post.href &&
                    "bg-theme-sidebar-active text-theme-sidebar-active-text font-semibold",
                )}
                activeOptions={{ exact: true }}
              >
                <span className="overflow-hidden truncate">{post.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
