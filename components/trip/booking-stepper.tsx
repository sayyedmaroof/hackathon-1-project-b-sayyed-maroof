"use client";

import { useState } from "react";
import type { Hack } from "@/lib/types";
import { cn } from "cn";

const award = [
  "Move the points to the airline that has the seat.",
  "Search the award on that airline, same dates.",
  "Book the seat before it disappears.",
  "Pay the taxes. That amount is the hacked price.",
];

const cash = [
  "Book the first leg on its own ticket.",
  "Leave enough time to land and check in again.",
  "Book the second leg separately.",
  "Keep both confirmations. A delay on the first is not covered.",
];

/** Numbered guide. Award steps when points are involved, otherwise a split-ticket booking. */
export function BookingStepper({ hacks }: { hacks: Hack[] }) {
  const awardBooking = hacks.includes("miles") || hacks.includes("transfer-partner");
  const steps = awardBooking ? award : cash;
  const [current, setCurrent] = useState(0);

  return (
    <div>
      <h3 className="font-display text-2xl tracking-tight">
        {awardBooking ? "Step-by-step award booking" : "Step-by-step booking"}
      </h3>
      <ol className="mt-4 space-y-2">
        {steps.map((step, index) => (
          <li key={step}>
            <button
              type="button"
              className={cn(
                "flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm",
                index === current ? "bg-paper" : "",
              )}
              aria-current={index === current ? "step" : undefined}
              onClick={() => setCurrent(index)}
            >
              <span className="num text-ink-muted">{index + 1}</span>
              <span>{step}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
