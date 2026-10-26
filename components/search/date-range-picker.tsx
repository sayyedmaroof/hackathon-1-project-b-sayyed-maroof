"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDay } from "@/lib/format";
import { cn } from "cn";

type DateRangePickerProps = {
  depart: string;
  returnDate?: string;
  onChange: (next: { depart: string; returnDate?: string }) => void;
  error?: string;
};

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Departure, with an optional return. Dates stay as ISO strings in the query. */
export function DateRangePicker({ depart, returnDate, onChange, error }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const selected: DateRange | undefined = depart
    ? {
        from: new Date(`${depart}T12:00:00`),
        to: returnDate ? new Date(`${returnDate}T12:00:00`) : undefined,
      }
    : undefined;

  const label = depart
    ? returnDate
      ? `${formatDay(`${depart}T12:00:00`)} – ${formatDay(`${returnDate}T12:00:00`)}`
      : formatDay(`${depart}T12:00:00`)
    : "Choose dates";

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">Dates</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex min-h-11 w-full items-center rounded-xl border bg-surface px-3 text-left text-sm",
            error ? "border-risk" : "border-line",
          )}
          aria-invalid={Boolean(error)}
          aria-label="Trip dates"
        >
          {label}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={(range) => {
              onChange({
                depart: range?.from ? toIso(range.from) : "",
                returnDate: range?.to ? toIso(range.to) : undefined,
              });
            }}
            disabled={{ before: new Date("2026-10-26T00:00:00") }}
          />
        </PopoverContent>
      </Popover>
      {error ? <p className="text-xs text-risk">{error}</p> : null}
    </div>
  );
}
