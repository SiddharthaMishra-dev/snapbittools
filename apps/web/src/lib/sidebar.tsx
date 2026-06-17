import { useLocation } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ROUTES_WITHOUT_SIDEBAR = ["/", "/tools", "/blogs"];

export function isSidebarRoute(pathname: string) {
  return !ROUTES_WITHOUT_SIDEBAR.includes(pathname);
}

type SidebarContextValue = {
  isOpen: boolean;
  isMobile: boolean;
  isSidebarRoute: boolean;
  toggleSidebar: () => void;
  setIsOpen: (open: boolean) => void;
  closeSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const onSidebarRoute = isSidebarRoute(pathname);

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen: onSidebarRoute ? isOpen : false,
      isMobile,
      isSidebarRoute: onSidebarRoute,
      toggleSidebar,
      setIsOpen,
      closeSidebar,
    }),
    [onSidebarRoute, isOpen, isMobile, toggleSidebar, closeSidebar],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
