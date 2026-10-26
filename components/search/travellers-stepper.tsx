"use client";

type TravellersStepperProps = {
  value: number;
  onChange: (value: number) => void;
  error?: string;
};

/** 1–9 travellers, with buttons large enough to tap. */
export function TravellersStepper({ value, onChange, error }: TravellersStepperProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">Travellers</span>
      <div className="flex min-h-11 items-center justify-between rounded-xl border border-line bg-surface px-2">
        <button
          type="button"
          className="size-11 rounded-lg text-lg"
          aria-label="Remove a traveller"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          −
        </button>
        <span className="num text-sm">{value}</span>
        <button
          type="button"
          className="size-11 rounded-lg text-lg"
          aria-label="Add a traveller"
          onClick={() => onChange(Math.min(9, value + 1))}
        >
          +
        </button>
      </div>
      {error ? <p className="text-xs text-risk">{error}</p> : null}
    </div>
  );
}
