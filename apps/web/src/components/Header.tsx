import React from "react";

import { IconApps, IconArticle } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, easeInOut } from "motion/react";

const navItems = [
  { path: "/tools", label: "All Tools", icon: <IconApps size={18} /> },
  { path: "/blogs", label: "Blogs", icon: <IconArticle size={18} /> },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const routerState = useRouterState();
  const isHome = routerState.location.pathname === "/";

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On the home page we use a light nav; on all other (dark) pages the original dark nav.
  const navBg = isHome
    ? isScrolled
      ? "bg-white/90 backdrop-blur-md border-gray-200 shadow-sm"
      : "bg-white/60 backdrop-blur-sm border-transparent"
    : isScrolled
    ? "bg-gray-900/90 backdrop-blur-md border-gray-800 shadow-lg"
    : "bg-transparent border-transparent";

  const linkCls = isHome
    ? "text-gray-600 hover:text-brand-primary hover:bg-blue-50 flex items-center gap-2 px-3 py-2 no-underline text-sm font-medium rounded-lg transition-all duration-200 ease-in-out"
    : "text-gray-300 hover:text-blue-400 hover:bg-white/5 flex items-center gap-2 px-3 py-2 no-underline text-sm font-medium rounded-lg transition-all duration-200 ease-in-out";

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: easeInOut, delay: 0.2 }}
      className={`w-full mx-auto rounded-lg fixed top-2 left-0 right-0 z-50 transition-all duration-300 ${navBg} border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / brand name (shown on home) */}
          {isHome && (
            <Link to="/" className="flex items-center gap-2 no-underline">
              <img src="/logo192.png" alt="SnapBit Tools" className="w-7 h-7" />
              <span className="text-sm font-bold text-gray-800">SnapBit Tools</span>
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className={`flex gap-1 lg:gap-2 ${isHome ? "ml-auto" : ""}`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={linkCls}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
