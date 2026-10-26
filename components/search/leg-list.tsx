"use client";

import { Reorder, useReducedMotion } from "motion/react";
import { AirportCombobox } from "@/components/search/airport-combobox";
import type { Leg } from "@/lib/types";

type LegListProps = {
  legs: Leg[];
  onChange: (legs: Leg[]) => void;
  errors?: Record<string, string>;
};

/** Reorderable stops. Up and down buttons keep it usable from the keyboard. */
export function LegList({ legs, onChange, errors }: LegListProps) {
  const reduce = useReducedMotion();

  const update = (id: string, partial: Partial<Leg>) => {
    onChange(legs.map((leg) => (leg.id === id ? { ...leg, ...partial } : leg)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...legs];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next);
  };

  const body = legs.map((leg, index) => (
    <div key={leg.id} className="rounded-[20px] border border-line bg-paper p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">Stop {index + 1}</p>
        <div className="flex gap-1">
          <button type="button" className="min-h-11 px-3 text-sm" aria-label="Move stop up" onClick={() => move(index, -1)}>
            Up
          </button>
          <button type="button" className="min-h-11 px-3 text-sm" aria-label="Move stop down" onClick={() => move(index, 1)}>
            Down
          </button>
          {legs.length > 1 ? (
            <button
              type="button"
              className="min-h-11 px-3 text-sm text-risk"
              onClick={() => onChange(legs.filter((item) => item.id !== leg.id))}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <AirportCombobox label="From" value={leg.from} onChange={(from) => update(leg.id, { from })} />
        <AirportCombobox label="To" value={leg.to} onChange={(to) => update(leg.id, { to })} />
        <label className="space-y-1.5 text-sm sm:col-span-2">
          <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">Date</span>
          <input
            type="date"
            value={leg.depart}
            onChange={(event) => update(leg.id, { depart: event.target.value })}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3"
          />
        </label>
      </div>
      {errors?.[leg.id] ? <p className="mt-2 text-xs text-risk">{errors[leg.id]}</p> : null}
    </div>
  ));

  if (reduce) return <div className="space-y-3">{body}</div>;

  return (
    <Reorder.Group axis="y" values={legs} onReorder={onChange} className="space-y-3">
      {legs.map((leg, index) => (
        <Reorder.Item key={leg.id} value={leg} className="cursor-grab active:cursor-grabbing">
          {body[index]}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
