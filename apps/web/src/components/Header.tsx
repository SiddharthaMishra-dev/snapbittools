import React from "react";

import { IconApps, IconArticle, IconLayoutSidebar } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { motion, easeInOut } from "motion/react";

import ThemeToggle from "@/components/ThemeToggle";
import { useSidebar } from "@/lib/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/tools", label: "All Tools", icon: <IconApps size={18} /> },
  { path: "/blogs", label: "Blogs", icon: <IconArticle size={18} /> },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { isOpen, isSidebarRoute, toggleSidebar } = useSidebar();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navBg = isScrolled
    ? "bg-theme-nav-bg backdrop-blur-md border-theme-nav-border shadow-sm"
    : "bg-theme-nav-bg-transparent backdrop-blur-sm border-transparent";

  const linkCls =
    "text-theme-nav-link hover:text-brand-primary hover:bg-theme-nav-link-hover-bg flex items-center gap-2 px-3 py-2 no-underline text-sm font-medium rounded-lg transition-all duration-200 ease-in-out";

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: easeInOut, delay: 0.2 }}
      className={cn(
        "w-full mx-auto rounded-lg fixed top-2 left-0 right-0 z-50 transition-all duration-300 border-b",
        navBg,
        isSidebarRoute && "max-w-[calc(100%-1rem)]",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-2 shrink-0">
            {isSidebarRoute && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center p-2 rounded-lg text-theme-nav-link hover:text-brand-primary hover:bg-theme-nav-link-hover-bg transition-colors duration-200"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={isOpen}
              >
                <IconLayoutSidebar size={20} stroke={1.75} />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 no-underline">
              <img src="/logo192.png" alt="SnapBit Tools" className="w-7 h-7" />
              <span className="text-sm font-bold text-theme-heading hidden sm:inline">SnapBit Tools</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={linkCls}>
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            <ThemeToggle className="ml-1" />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
