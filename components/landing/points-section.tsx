"use client";

import { useState } from "react";
import { FlipNumber } from "@/components/fare/flip-number";
import { Section } from "@/components/layout/section";
import { Slider } from "@/components/ui/slider";
import { usePreferences } from "@/hooks/use-preferences";
import { formatCount, formatMoney } from "@/lib/format";

const POINT_VALUE = 0.012;

/** A small calculator. One point is worth about 1.2 cents on this sample flight. */
export function PointsSection() {
  const [points, setPoints] = useState(38000);
  const { prefs } = usePreferences();
  const worth = Math.round(points * POINT_VALUE);

  return (
    <Section
      id="points"
      className="border-y border-line bg-surface"
      eyebrow="Miles and points"
      title={
        <>
          Points are just another way <span className="italic">to pay.</span>
        </>
      }
      description="No charts to memorise. If a saver seat exists, we show what you still pay in taxes."
    >
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm text-ink-muted">You have</p>
          <p className="num mt-1 text-4xl">{formatCount(points)} points</p>
          <Slider
            className="mt-6"
            min={0}
            max={120000}
            step={1000}
            value={[points]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              if (typeof next === "number") setPoints(next);
            }}
            aria-label="Points balance"
          />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
            On a sample Madrid to Lisbon award, those points cover the seat. The hacked price
            left over is the tax, not a made-up zero.
          </p>
        </div>
        <div className="rounded-[24px] border border-line bg-paper p-6">
          <p className="text-xs tracking-[0.16em] text-ink-muted uppercase">Worth about</p>
          <p className="mt-3 text-5xl text-saving md:text-6xl">
            <FlipNumber value={formatMoney(worth, prefs.currency)} />
          </p>
          <p className="mt-3 text-sm text-ink-muted">Sample value on this flight. Not a live quote.</p>
        </div>
      </div>
    </Section>
  );
}
