import React from "react";

import { IconApps, IconArticle, IconBraces, IconFileTypePdf, IconPhoto, IconTools } from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";

import ThemeToggle from "@/components/ThemeToggle";
import { ToolSearch } from "@/components/ToolSearch";
import { TOOL_CATEGORY_ORDER, getToolsByCategory, toolCategories, type ToolCategory } from "@/data/tools";
import { cn } from "@/lib/utils";

const categoryIcons = {
  Images: IconPhoto,
  PDF: IconFileTypePdf,
  Data: IconBraces,
  Utility: IconTools,
} as const;

const categoryIconColor: Record<ToolCategory, string> = {
  Images: "text-[#2563eb]",
  PDF: "text-[#e11d48]",
  Data: "text-[#7c3aed]",
  Utility: "text-[#059669]",
};

const linkCls =
  "text-theme-nav-link hover:text-brand-primary hover:bg-theme-nav-link-hover-bg flex items-center gap-2 px-2.5 lg:px-3 py-2 no-underline text-sm font-medium rounded-lg transition-all duration-200 ease-in-out shrink-0";

const activeCls = "text-brand-primary bg-theme-nav-link-hover-bg";

function CategoryMenu({
  category,
  pathname,
  open,
  onOpen,
  onClose,
}: {
  category: ToolCategory;
  pathname: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const meta = toolCategories[category];
  const categoryTools = getToolsByCategory(category);
  const Icon = categoryIcons[category];
  const active = pathname === meta.href || categoryTools.some((tool) => pathname === tool.href);
  const alignRight = category === "Data" || category === "Utility";

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <Link
        to={meta.href}
        className={cn(linkCls, (active || open) && activeCls)}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(event) => {
          if (window.matchMedia("(hover: none)").matches) {
            event.preventDefault();
            if (open) onClose();
            else onOpen();
          }
        }}
      >
        <Icon size={18} />
        <span className="hidden md:inline">{meta.navLabel}</span>
      </Link>
      {open && (
        <div className={cn("absolute top-full z-50 pt-2", alignRight ? "right-0" : "left-0")}>
          <ul className="min-w-56 rounded-xl border border-theme-border bg-theme-surface py-1.5 shadow-xl">
            {categoryTools.map((tool) => {
              const ToolIcon = tool.icon;
              const current = pathname === tool.href;
              return (
                <li key={tool.slug}>
                  <Link
                    to={tool.href}
                    className={cn(
                      "mx-1.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-theme-body no-underline hover:bg-theme-surface-muted",
                      current && "bg-[#dbeafe] font-medium text-[#1d4ed8] dark:bg-[#1e3a8a]/40 dark:text-[#bfdbfe]",
                    )}
                    aria-current={current ? "page" : undefined}
                  >
                    <ToolIcon size={18} stroke={1.75} className={cn("shrink-0", categoryIconColor[category])} />
                    <span>{tool.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [openCategory, setOpenCategory] = React.useState<ToolCategory | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setOpenCategory(null);
  }, [pathname]);

  React.useEffect(() => {
    if (!openCategory) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpenCategory(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenCategory(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openCategory]);

  const navBg = isScrolled
    ? "bg-theme-nav-bg backdrop-blur-md border-theme-nav-border shadow-sm"
    : "bg-theme-nav-bg-transparent backdrop-blur-sm border-transparent";

  return (
    <nav
      className={cn(
        "w-full mx-auto rounded-lg fixed top-2 left-0 right-0 z-50 transition-all duration-300 border-b",
        navBg,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <img src="/logo192.png" alt="SnapBit Tools" width={28} height={28} className="w-7 h-7" />
              <span className="text-sm font-bold text-theme-heading hidden sm:inline">SnapBit Tools</span>
            </Link>
          </div>

          <div className="flex items-center min-w-0 gap-1">
            <div ref={menuRef} className="flex items-center gap-0.5 lg:gap-1 min-w-0">
              {TOOL_CATEGORY_ORDER.map((category) => (
                <CategoryMenu
                  key={category}
                  category={category}
                  pathname={pathname}
                  open={openCategory === category}
                  onOpen={() => setOpenCategory(category)}
                  onClose={() => setOpenCategory((current) => (current === category ? null : current))}
                />
              ))}
              <Link to="/tools" className={cn(linkCls, pathname === "/tools" && activeCls)}>
                <IconApps size={18} />
                <span className="hidden lg:inline">All</span>
              </Link>
              <Link to="/blogs" className={cn(linkCls, pathname === "/blogs" && activeCls)}>
                <IconArticle size={18} />
                <span className="hidden lg:inline">Blogs</span>
              </Link>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ToolSearch />
              <ThemeToggle className="ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
