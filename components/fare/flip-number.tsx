"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "cn";

type FlipNumberProps = {
  value: string;
  className?: string;
};

/**
 * Split-flap digits. Each numeral folds down, staggered.
 * Reduced motion crossfades the whole string instead.
 */
export function FlipNumber({ value, className }: FlipNumberProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <span className={cn("num inline-block transition-opacity duration-300", className)}>
        {value}
      </span>
    );
  }

  return (
    <span
      className={cn("num inline-flex items-end", className)}
      role="img"
      aria-label={value}
    >
      {value.split("").map((char, index) =>
        /\d/.test(char) ? (
          <FlapDigit key={index} char={char} delay={index * 55} />
        ) : (
          <span key={`${index}-${char}`} className="inline-block px-[0.04em]">
            {char === " " ? "\u00a0" : char}
          </span>
        ),
      )}
    </span>
  );
}

function FlapDigit({ char, delay }: { char: string; delay: number }) {
  const [current, setCurrent] = useState(char);
  const [previous, setPrevious] = useState(char);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (char === current) return;
    const start = window.setTimeout(() => {
      setPrevious(current);
      setActive(true);
    }, delay);
    const finish = window.setTimeout(() => {
      setCurrent(char);
      setActive(false);
    }, delay + 420);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(finish);
    };
  }, [char, current, delay]);

  return (
    <span
      className="relative mx-[1px] inline-flex h-[1.15em] w-[0.72em] overflow-hidden rounded-[3px] bg-ink text-paper [perspective:200px]"
      aria-hidden="true"
    >
      <span className="absolute inset-0 flex items-center justify-center">{current}</span>
      {active ? (
        <>
          <span className="flap-top absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-ink">
            <span className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center">
              {previous}
            </span>
          </span>
          <span className="flap-bottom absolute inset-x-0 bottom-0 h-1/2 origin-top overflow-hidden bg-[#2a241e]">
            <span className="absolute inset-x-0 bottom-0 flex h-[200%] items-center justify-center">
              {char}
            </span>
          </span>
        </>
      ) : null}
      <span className="absolute inset-x-0 top-1/2 z-10 h-px bg-paper/25" />
    </span>
  );
}
