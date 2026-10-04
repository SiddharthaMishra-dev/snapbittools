import { useEffect, useRef, useState } from "react";

import type { ProcessedCountSnapshot } from "@/lib/processedCount";
import { getProcessedCount } from "@/server/processedCount";

const POLL_MS = 20_000;
const STEP_MS = 700;
const FLIP_MS = 600;

export function ProcessedCount() {
  const [snapshot, setSnapshot] = useState<ProcessedCountSnapshot | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await getProcessedCount();
        if (cancelled) return;
        setSnapshot(next);
        setShown((current) => current ?? next.total);
        setReady(true);
      } catch {
        // Keep the last total if a later refresh fails. Hide the line until the first read succeeds.
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
        if (current === null) return target;
        if (current < target) return current + 1;
        if (current > target) return target;
        return current;
      });
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [snapshot]);

  if (!ready || shown === null) return null;

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
