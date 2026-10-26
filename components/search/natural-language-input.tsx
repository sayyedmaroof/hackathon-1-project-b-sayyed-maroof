"use client";

import { listAirports } from "@/lib/api/content";

const chips = [
  "Weekend in Lisbon from Madrid",
  "Berlin to Barcelona in November",
  "Paris, then Rome, then Athens",
];

type NaturalLanguageInputProps = {
  onInterpret: (text: string) => void;
};

/** Free text, plus chips that already know what they mean. */
export function NaturalLanguageInput({ onInterpret }: NaturalLanguageInputProps) {
  return (
    <div className="rounded-[20px] border border-line bg-paper p-4">
      <label htmlFor="trip-words" className="text-sm font-medium">
        Describe your trip
      </label>
      <textarea
        id="trip-words"
        className="mt-2 min-h-24 w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm"
        placeholder="Two of us, Madrid to Lisbon, sometime in mid November."
        onBlur={(event) => {
          if (event.target.value.trim()) onInterpret(event.target.value);
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="min-h-11 rounded-full border border-line px-3 text-sm"
            onClick={() => onInterpret(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        We match city names we know ({listAirports().length} airports) and fill the form.
      </p>
    </div>
  );
}
