"use client";

import { useMemo, useState } from "react";
import { listAirports } from "@/lib/api/content";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

type AirportComboboxProps = {
  label: string;
  value: string;
  onChange: (code: string) => void;
  error?: string;
};

/** Airport search with a city-cluster hint, e.g. Madrid: MAD. */
export function AirportCombobox({ label, value, onChange, error }: AirportComboboxProps) {
  const [open, setOpen] = useState(false);
  const airports = listAirports();
  const selected = airports.find((airport) => airport.code === value);
  const cluster = useMemo(() => {
    if (!selected) return [];
    return airports.filter((airport) => airport.cluster === selected.cluster);
  }, [airports, selected]);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex min-h-11 w-full items-center justify-between rounded-xl border bg-surface px-3 text-left text-sm",
            error ? "border-risk" : "border-line",
          )}
          aria-invalid={Boolean(error)}
          aria-label={label}
        >
          {selected ? (
            <span>
              {selected.city}
              <span className="num text-ink-muted"> · {selected.code}</span>
            </span>
          ) : (
            <span className="text-ink-muted">City or airport</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2.5rem,22rem)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search Madrid, LIS…" />
            <CommandList>
              <CommandEmpty>No airport under that name.</CommandEmpty>
              {airports.map((airport) => (
                <CommandItem
                  key={airport.code}
                  value={`${airport.city} ${airport.code} ${airport.name}`}
                  onSelect={() => {
                    onChange(airport.code);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1">
                    {airport.city}
                    <span className="text-ink-muted"> · {airport.name}</span>
                  </span>
                  <span className="num text-xs">{airport.code}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && cluster.length > 1 ? (
        <p className="text-xs text-ink-muted">
          {selected.cluster}: {cluster.map((airport) => airport.code).join(", ")}
        </p>
      ) : null}
      {error ? <p className="text-xs text-risk">{error}</p> : null}
    </div>
  );
}
