import { motion } from "motion/react";
import { useRef, useState } from "react";

interface ButtonProps {
  children: React.ReactNode;
}

export function Button({ children }: ButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const { width, height, top, left } = ref.current.getBoundingClientRect();
    const { clientX, clientY } = e;

    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    setPosition({ x, y });
  };
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const hasMoved = position.x !== 0 || position.y !== 0;

  return (
    <>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={
          "border-2 border-dashed border-neutral-600 rounded-lg [--show-color:var(--color-neutral-400)] transition-colors duration-300 text-shadow-2xs"
        }
        style={{
          borderColor: hasMoved ? "var(--show-color)" : "transparent",
          backgroundColor: hasMoved
            ? "color-mix(in srgb, var(--show-color) 30%, transparent)"
            : "transparent",
        }}
      >
        <motion.div
          ref={ref}
          animate={{ x: position.x, y: position.y }}
          transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </>
  );
}
