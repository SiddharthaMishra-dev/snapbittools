import { useEffect, useState } from "react";
import { AnimatePresence, easeInOut, motion } from "motion/react";
import { Link } from "@tanstack/react-router";

const HERO_WIDTHS = [480, 800, 1349] as const;

/** Matches the frame: page padding plus the 14px matte on each side, capped at the 64rem column. */
export const HERO_IMAGE_SIZES = "(min-width: 64rem) calc(64rem - 28px), calc(100vw - 2rem - 28px)";

function heroSrcSet(id: number) {
  return HERO_WIDTHS.map((width) => `/markups/${id}-${width}.webp ${width}w`).join(", ");
}

/** First slide is the homepage LCP image. Keep this URL in the initial HTML. */
export const HERO_LCP_IMAGE = "/markups/1-800.webp";
export const HERO_LCP_SRCSET = heroSrcSet(1);

const HERO_SCREENSHOTS = [
  { src: HERO_LCP_IMAGE, srcSet: HERO_LCP_SRCSET, alt: "Image tools" },
  { src: "/markups/2-800.webp", srcSet: heroSrcSet(2), alt: "PDF tools" },
  { src: "/markups/3-800.webp", srcSet: heroSrcSet(3), alt: "Data tools" },
  { src: "/markups/4-800.webp", srcSet: heroSrcSet(4), alt: "Utility tools" },
] as const;

const HERO_FRAME = { width: 1349, height: 547 } as const;

const SLIDE_MS = 5000;
const FADE_SECONDS = 0.7;

export function HeroScreenshotCanvas() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const preloadRest = () => {
      for (const { src, srcSet } of HERO_SCREENSHOTS.slice(1)) {
        const img = new Image();
        img.decoding = "async";
        img.sizes = HERO_IMAGE_SIZES;
        img.srcset = srcSet;
        img.src = src;
      }
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preloadRest);
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(preloadRest, 1500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_SCREENSHOTS.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, []);

  const slide = HERO_SCREENSHOTS[index];

  return (
    <div className="relative w-full overflow-hidden">
      <Link
        to="/tools"
        aria-label="View all SnapBit Tools"
        className="block focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-lg"
      >
        <img
          src={HERO_LCP_IMAGE}
          srcSet={HERO_LCP_SRCSET}
          sizes={HERO_IMAGE_SIZES}
          alt=""
          aria-hidden="true"
          width={HERO_FRAME.width}
          height={HERO_FRAME.height}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="block w-full invisible"
        />
        <AnimatePresence initial={false}>
          <motion.img
            key={slide.src}
            src={slide.src}
            srcSet={slide.srcSet}
            sizes={HERO_IMAGE_SIZES}
            alt={slide.alt}
            width={HERO_FRAME.width}
            height={HERO_FRAME.height}
            fetchPriority={"high"}
            loading={slide.src === HERO_LCP_IMAGE ? "eager" : "lazy"}
            decoding="async"
            initial={slide.src === HERO_LCP_IMAGE ? false : { opacity: 0, filter: "blur(14px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(14px)" }}
            transition={{ duration: FADE_SECONDS, ease: easeInOut }}
            className="absolute inset-0 h-full w-full object-cover object-top cursor-pointer"
          />
        </AnimatePresence>
      </Link>
    </div>
  );
}
