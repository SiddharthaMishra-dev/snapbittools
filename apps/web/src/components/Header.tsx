import React from "react";

import { IconApps } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const navItems = [{ path: "/tools", label: "Tools", icon: <IconApps size={18} /> }];

const Header: React.FC = () => {
  return (
    <nav className="max-w-5xl w-[95%] mx-auto rounded-lg  fixed top-2 left-0 right-0 z-50 bg-slate-900/30 backdrop-blur-xl border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center no-underline text-xl font-bold text-gray-100"
          >
            <img
              src="/logo192.png"
              alt="Logo"
              className="inline-block mr-2 w-8 h-8"
            />
            <span className="text-blue-400">SnapBit Tools</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="flex gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-300 hover:text-blue-400 hover:bg-white/5 flex items-center gap-2 px-3 py-2 no-underline text-sm font-medium rounded-lg transition-all duration-200 ease-in-out"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          {/* <button
            className="block md:hidden bg-transparent border-none text-gray-100 cursor-pointer p-2 transition-colors hover:text-blue-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button> */}
        </div>

        {/* Mobile Navigation */}
        {/* {isMenuOpen && (
          <div className="md:hidden flex flex-col gap-1 py-4 border-t border-white/5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )} */}
      </div>
    </nav>
  );
};

export default Header;
