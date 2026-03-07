import { Link } from "@tanstack/react-router";
import { useRef, useState, useCallback } from "react";

interface GlowCardProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
  isNew?: boolean;
}

export default function GlowCard({
  to,
  children,
  className = "",
  icon: Icon,
  isNew,
}: GlowCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <Link
      ref={cardRef}
      to={to}
      className={`group relative bg-transparent border border-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-8 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: isHovered
          ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.06), transparent 40%), rgb(31 41 55)`
          : undefined,
      }}
    >
      {Icon && (
        <div className="absolute -right-4 -bottom-4 text-white/[0.03] transition-colors duration-300 group-hover:text-white/[0.04]">
          <Icon
            size={160}
            stroke={1.5}
          />
        </div>
      )}

      {Icon && isHovered && (
        <div
          className="absolute -right-4 -bottom-4 text-blue-500/15 pointer-events-none transition-opacity duration-300"
          style={{
            maskImage: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
            WebkitMaskImage: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          }}
        >
          <Icon
            size={160}
            stroke={1.5}
          />
        </div>
      )}

      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.15), transparent 40%)`,
        }}
      />

      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          padding: "1px",
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.4), transparent 40%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor",
          WebkitMaskComposite: "xor",
        }}
      />

      {isNew && (
        <div className="absolute top-4 right-4 z-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
            New
          </span>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </Link>
  );
}
