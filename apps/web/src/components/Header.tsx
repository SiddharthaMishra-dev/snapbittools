import React from "react";

import {
  IconApps,
  IconArticle,
  IconBraces,
  IconChevronDown,
  IconFileTypePdf,
  IconMenu2,
  IconPhoto,
  IconTools,
  IconX,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import { easeInOut, motion } from "motion/react";

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

const categoryIconTile: Record<ToolCategory, string> = {
  Images: "bg-[#2563eb] shadow-[0_3px_8px_rgba(37,99,235,0.45)]",
  PDF: "bg-[#e11d48] shadow-[0_3px_8px_rgba(225,29,72,0.4)]",
  Data: "bg-[#7c3aed] shadow-[0_3px_8px_rgba(124,58,237,0.4)]",
  Utility: "bg-[#059669] shadow-[0_3px_8px_rgba(5,150,105,0.4)]",
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

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <Link
        to={meta.href}
        className={cn(linkCls, (active || open) && activeCls)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Icon size={18} />
        <span>{meta.navLabel}</span>
      </Link>
      {open && (
        <div className="absolute top-full left-1/2 z-50 w-72 -translate-x-1/2 pt-2">
          <ul className="rounded-xl border border-theme-border bg-theme-surface py-2 shadow-xl">
            {categoryTools.map((tool) => {
              const ToolIcon = tool.icon;
              const current = pathname === tool.href;
              return (
                <li key={tool.slug}>
                  <Link
                    to={tool.href}
                    className={cn(
                      "mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-base text-theme-body no-underline hover:bg-theme-surface-muted",
                      current && "bg-[#dbeafe] font-medium text-[#1d4ed8] dark:bg-[#1e3a8a]/40 dark:text-[#bfdbfe]",
                    )}
                    aria-current={current ? "page" : undefined}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
                        categoryIconTile[category],
                      )}
                    >
                      <ToolIcon size={20} stroke={1.75} />
                    </span>
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
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileCategory, setMobileCategory] = React.useState<ToolCategory | null>(null);
  const headerRef = React.useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const [playHomeIntro] = React.useState(() => pathname === "/");

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpenCategory(null);
    setMobileOpen(false);
    setMobileCategory(null);
  }, [pathname]);

  React.useEffect(() => {
    if (!openCategory && !mobileOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenCategory(null);
        setMobileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenCategory(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openCategory, mobileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <motion.header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 bg-gray-200 dark:bg-theme-nav-bg"
      initial={playHomeIntro ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: easeInOut }}
    >
      <div
        className={cn(
          "grid h-16 grid-cols-[1fr_auto] items-center gap-3 border-b bg-theme-nav-bg px-4 backdrop-blur-md transition-colors md:px-6 lg:grid-cols-[1fr_auto_1fr]",
          isScrolled ? "border-theme-nav-border" : "border-transparent",
        )}
      >
        <Link to="/" className="col-start-1 flex w-fit items-center gap-2 justify-self-start whitespace-nowrap no-underline">
          <img src="/logo192.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="text-sm font-bold text-theme-heading">SnapBit Tools</span>
        </Link>

        <nav aria-label="Tools" className="hidden items-center gap-0.5 lg:col-start-2 lg:flex">
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
            <span>All</span>
          </Link>
          <Link to="/blogs" className={cn(linkCls, pathname === "/blogs" && activeCls)}>
            <IconArticle size={18} />
            <span>Blogs</span>
          </Link>
        </nav>

        <div className="col-start-2 flex items-center justify-self-end gap-1.5 lg:col-start-3">
          <ToolSearch />
          <ThemeToggle className="ml-0.5 hidden lg:inline-flex" />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-theme-heading hover:bg-theme-nav-link-hover-bg lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Tools"
          className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-theme-border bg-theme-nav-bg px-4 py-3 shadow-lg lg:hidden"
        >
          <ul className="space-y-1">
            {TOOL_CATEGORY_ORDER.map((category) => {
              const meta = toolCategories[category];
              const categoryTools = getToolsByCategory(category);
              const Icon = categoryIcons[category];
              const expanded = mobileCategory === category;
              const active = pathname === meta.href || categoryTools.some((tool) => pathname === tool.href);
              return (
                <li key={category}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-theme-nav-link",
                      (active || expanded) && activeCls,
                    )}
                    aria-expanded={expanded}
                    onClick={() => setMobileCategory((current) => (current === category ? null : category))}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{meta.navLabel}</span>
                    <IconChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
                  </button>
                  {expanded && (
                    <ul className="mb-1 ml-3 space-y-0.5 border-l border-theme-border pl-2">
                      {categoryTools.map((tool) => {
                        const ToolIcon = tool.icon;
                        const current = pathname === tool.href;
                        return (
                          <li key={tool.slug}>
                            <Link
                              to={tool.href}
                              className={cn(
                                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-theme-body no-underline hover:bg-theme-surface-muted",
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
                      <li>
                        <Link to={meta.href} className="block rounded-md px-2.5 py-2 text-sm font-medium text-brand-primary no-underline">
                          All {meta.navLabel.toLowerCase()} tools
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            })}
            <li>
              <Link to="/tools" className={cn(linkCls, "px-3 py-2.5", pathname === "/tools" && activeCls)}>
                <IconApps size={18} />
                All tools
              </Link>
            </li>
            <li>
              <Link to="/blogs" className={cn(linkCls, "px-3 py-2.5", pathname === "/blogs" && activeCls)}>
                <IconArticle size={18} />
                Blogs
              </Link>
            </li>
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-theme-border px-3 pt-3">
            <span className="text-sm font-medium text-theme-heading">Theme</span>
            <ThemeToggle />
          </div>
        </nav>
      )}
    </motion.header>
  );
};

export default Header;
