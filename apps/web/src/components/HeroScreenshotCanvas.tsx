import { useEffect, useRef } from "react";

import { useTheme } from "@/lib/theme";

function getPageBackground(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--theme-page").trim() || "#ffffff"
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
}

/** Same hue as page bg at 0 alpha — avoids grey band from black→white interpolation */
function transparentPageBackground(): string {
  const rgb = hexToRgb(getPageBackground());
  if (!rgb) return "rgba(255, 255, 255, 0)";
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`;
}

export function HeroScreenshotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageSrc = theme === "dark" ? "/dark.png" : "/light.png";
    const image = new Image();
    let cancelled = false;

    const paint = () => {
      if (cancelled || !image.complete || !image.naturalWidth) return;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = container.clientWidth;
      const cssHeight = cssWidth * (image.naturalHeight / image.naturalWidth);

      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.drawImage(image, 0, 0, cssWidth, cssHeight);
    };

    image.onload = paint;
    image.src = imageSrc;

    const resizeObserver = new ResizeObserver(paint);
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      image.onload = null;
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="w-full"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="SnapBit Tools interface preview"
        className="block w-full"
      />
    </div>
  );
}
