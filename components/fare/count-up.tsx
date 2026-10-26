"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "cn";

type CountUpProps = {
  value: number;
  format?: (value: number) => string;
  className?: string;
};

/** Counts to a number. Reduced motion jumps straight to the final value. */
export function CountUp({ value, format = (next) => String(next), className }: CountUpProps) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce, value]);

  const display = reduce ? value : shown;
  return <span className={cn("num", className)}>{format(display)}</span>;
}
