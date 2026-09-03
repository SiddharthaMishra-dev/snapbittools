import { useEffect, useState } from "react";
import { AnimatePresence, easeInOut, motion } from "motion/react";
import { Link } from "@tanstack/react-router";

const HERO_SCREENSHOTS = [
  { src: "/markups/1.png", alt: "Image tools preview" },
  { src: "/markups/2.png", alt: "PDF tools preview" },
  { src: "/markups/3.png", alt: "Data tools preview" },
  { src: "/markups/4.png", alt: "Utility tools preview" },
] as const;

const SLIDE_MS = 5000;
const FADE_SECONDS = 0.7;

export function HeroScreenshotCanvas() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    HERO_SCREENSHOTS.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
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
        <img src={HERO_SCREENSHOTS[0].src} alt="" aria-hidden="true" className="block w-full invisible" />
        <AnimatePresence initial={false}>
          <motion.img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            initial={{ opacity: 0, filter: "blur(14px)" }}
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
