import { useEffect, useRef, useState } from "react";

import type { ProcessedCountSnapshot } from "@/lib/processedCount";
import { getProcessedCount } from "@/server/processedCount";

const POLL_MS = 20_000;
const STEP_MS = 700;
const FLIP_MS = 600;

export function ProcessedCount({ initial }: { initial: ProcessedCountSnapshot }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [shown, setShown] = useState(initial.total);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await getProcessedCount();
        if (cancelled) return;
        setSnapshot(next);
      } catch {
        // Keep the number already on screen if a later refresh fails.
      }
    };

    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!snapshot) return;

    const target = snapshot.total;
    const id = window.setInterval(() => {
      setShown((current) => {
        if (current === target) return current;
        // A refresh can paint the last build's total before Redis answers.
        // Jump to the stored total instead of ticking through the gap.
        if (Math.abs(target - current) > 1) return target;
        return current < target ? current + 1 : target;
      });
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [snapshot]);

  const formatted = shown.toLocaleString("en-US");
  const label = `${formatted} files processed`;
  const characters = formatted.split("");

  return (
    <div className="flex flex-col items-center gap-2.5" aria-label={label}>
      <div className="flex items-end gap-1.5" aria-hidden="true">
        {characters.map((character, index) => {
          const place = characters.length - index;
          if (character === ",") {
            return (
              <span key={`sep-${place}`} className="px-0.5 pb-1 text-3xl font-bold leading-none text-theme-muted sm:text-4xl">
                ,
              </span>
            );
          }
          return <FlipDigit key={place} digit={character} />;
        })}
      </div>
      <p className="text-sm font-semibold tracking-wide text-theme-muted sm:text-base">files processed</p>
    </div>
  );
}

function FlipDigit({ digit }: { digit: string }) {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const currentRef = useRef(digit);

  useEffect(() => {
    if (digit === currentRef.current) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrevious(currentRef.current);
    currentRef.current = digit;
    setCurrent(digit);
    if (reduceMotion) return;

    setFlipping(true);
    const id = window.setTimeout(() => setFlipping(false), FLIP_MS);
    return () => window.clearTimeout(id);
  }, [digit]);

  return (
    <span className="flip-digit">
      <span className="flip-digit-face">
        <span className="flip-digit-half flip-digit-top">
          <span>{current}</span>
        </span>
        <span className="flip-digit-half flip-digit-bottom">
          <span>{flipping ? previous : current}</span>
        </span>
      </span>
      {flipping ? (
        <>
          <span className="flip-digit-flap flip-digit-flap-top">
            <span>{previous}</span>
          </span>
          <span className="flip-digit-flap flip-digit-flap-bottom">
            <span>{current}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}
