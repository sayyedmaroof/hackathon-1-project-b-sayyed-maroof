"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AirportCombobox } from "@/components/search/airport-combobox";
import { DateRangePicker } from "@/components/search/date-range-picker";
import { FlexibilityToggle } from "@/components/search/flexibility-toggle";
import { TravellersStepper } from "@/components/search/travellers-stepper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasQueryErrors, validateTripQuery } from "@/lib/validate-query";
import { resultsHref } from "@/lib/query";
import type { Cabin, TripMode, TripQuery } from "@/lib/types";

const cabins: { id: Cabin; label: string }[] = [
  { id: "economy", label: "Economy" },
  { id: "premium", label: "Premium" },
  { id: "business", label: "Business" },
];

/** Hero and footer search. Full trip planning lives on /plan. */
export function SearchCard({ id = "search" }: { id?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<TripMode>("quick");
  const [from, setFrom] = useState("MAD");
  const [to, setTo] = useState("LIS");
  const [depart, setDepart] = useState("2026-11-12");
  const [returnDate, setReturnDate] = useState<string | undefined>("2026-11-16");
  const [travellers, setTravellers] = useState(1);
  const [cabin, setCabin] = useState<Cabin>("economy");
  const [flex, setFlex] = useState(true);
  const [errors, setErrors] = useState<ReturnType<typeof validateTripQuery>>({});

  const submit = () => {
    const query: TripQuery = {
      mode,
      travellers,
      cabin,
      flexDays: flex ? 3 : 0,
      legs: [{ id: "leg-1", from, to, depart, returnDate }],
    };
    const nextErrors = validateTripQuery(query);
    setErrors(nextErrors);
    if (hasQueryErrors(nextErrors)) return;
    if (mode === "full") {
      router.push(`/plan?${new URLSearchParams({ from, to, depart, mode: "full" })}`);
      return;
    }
    router.push(resultsHref(query));
  };

  return (
    <form
      id={id}
      className="rounded-[24px] border border-line bg-surface p-4 shadow-elevated md:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Tabs value={mode} onValueChange={(value) => setMode(value as TripMode)}>
        <TabsList className="h-auto min-h-11 w-full">
          <TabsTrigger value="quick" className="min-h-11 flex-1">
            Quick Flight
          </TabsTrigger>
          <TabsTrigger value="full" className="min-h-11 flex-1">
            Full Trip Plan
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <AirportCombobox label="From" value={from} onChange={setFrom} error={errors.from} />
        <AirportCombobox label="To" value={to} onChange={setTo} error={errors.to} />
        <DateRangePicker
          depart={depart}
          returnDate={returnDate}
          error={errors.depart}
          onChange={(next) => {
            setDepart(next.depart);
            setReturnDate(next.returnDate);
          }}
        />
        <TravellersStepper value={travellers} onChange={setTravellers} error={errors.travellers} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">Cabin</span>
          <select
            value={cabin}
            onChange={(event) => setCabin(event.target.value as Cabin)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3"
            aria-label="Cabin"
          >
            {cabins.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="self-end">
          <FlexibilityToggle
            enabled={flex}
            days={3}
            onChange={(next) => setFlex(next.enabled)}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        {mode === "full"
          ? "We will open the planner so you can add stops."
          : "One route. One flipped fare."}
      </p>
      <Button type="submit" className="mt-4 w-full">
        {mode === "full" ? "Build the trip" : "Flip this fare"}
      </Button>
    </form>
  );
}
