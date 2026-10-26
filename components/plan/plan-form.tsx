"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AirportCombobox } from "@/components/search/airport-combobox";
import { DateRangePicker } from "@/components/search/date-range-picker";
import { FlexibilityToggle } from "@/components/search/flexibility-toggle";
import { LegList } from "@/components/search/leg-list";
import { NaturalLanguageInput } from "@/components/search/natural-language-input";
import { ScreenshotDropzone } from "@/components/search/screenshot-dropzone";
import { TravellersStepper } from "@/components/search/travellers-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listAirports, listPrograms } from "@/lib/api/content";
import { resultsHref } from "@/lib/query";
import type { Cabin, Leg, TripMode, TripQuery } from "@/lib/types";
import { hasQueryErrors, validateTripQuery } from "@/lib/validate-query";
import { toast } from "sonner";

type PlanFormProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function blankLeg(index: number): Leg {
  return { id: `leg-${index}-${Math.random().toString(36).slice(2, 7)}`, from: "", to: "", depart: "" };
}

/** The front door: one route, or a list of stops, plus the extra ways in. */
export function PlanForm({ searchParams }: PlanFormProps) {
  const params = use(searchParams);
  const router = useRouter();
  const airports = listAirports();
  const programs = listPrograms();

  const [mode, setMode] = useState<TripMode>(first(params.mode) === "full" ? "full" : "quick");
  const [from, setFrom] = useState(first(params.from) ?? "MAD");
  const [to, setTo] = useState(first(params.to) ?? "LIS");
  const [depart, setDepart] = useState(first(params.depart) ?? "2026-11-12");
  const [returnDate, setReturnDate] = useState<string | undefined>("2026-11-16");
  const [travellers, setTravellers] = useState(1);
  const [cabin, setCabin] = useState<Cabin>("economy");
  const [flexOn, setFlexOn] = useState(true);
  const [legs, setLegs] = useState<Leg[]>([
    { id: "leg-1", from: first(params.from) ?? "MAD", to: "CDG", depart: "2026-11-12" },
    { id: "leg-2", from: "CDG", to: first(params.to) ?? "FCO", depart: "2026-11-16" },
  ]);
  const [link, setLink] = useState("");
  const [linkNote, setLinkNote] = useState<string | null>(null);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<ReturnType<typeof validateTripQuery>>({});
  const hack = first(params.hack);

  const query = useMemo<TripQuery>(() => {
    return {
      mode,
      travellers,
      cabin,
      flexDays: flexOn ? 3 : 0,
      legs:
        mode === "quick"
          ? [{ id: "leg-1", from, to, depart, returnDate }]
          : legs,
      programs: Object.entries(balances)
        .filter(([, balance]) => Number(balance) > 0)
        .map(([programId, balance]) => ({ programId, balance: Number(balance) })),
    };
  }, [balances, cabin, depart, flexOn, from, legs, mode, returnDate, to, travellers]);

  const submit = () => {
    const next = validateTripQuery(query);
    setErrors(next);
    if (hasQueryErrors(next)) return;
    router.push(resultsHref(query));
  };

  const interpret = (text: string) => {
    const found = airports.filter((airport) =>
      text.toLowerCase().includes(airport.city.toLowerCase()),
    );
    const unique = [...new Map(found.map((airport) => [airport.code, airport])).values()];
    if (unique.length < 2) {
      toast("Name two cities we know, like Madrid and Lisbon.");
      return;
    }
    if (text.toLowerCase().includes("then") || unique.length > 2) {
      setMode("full");
      const nextLegs: Leg[] = [];
      for (let index = 0; index < unique.length - 1; index += 1) {
        nextLegs.push({
          id: `nl-${index}`,
          from: unique[index]!.code,
          to: unique[index + 1]!.code,
          depart: "2026-11-12",
        });
      }
      setLegs(nextLegs);
    } else {
      setMode("quick");
      setFrom(unique[0]!.code);
      setTo(unique[1]!.code);
    }
    toast.success("Filled the form from that description");
  };

  const prefillSample = () => {
    setMode("quick");
    setFrom("MAD");
    setTo("LIS");
    setDepart("2026-11-12");
    setReturnDate("2026-11-16");
    toast.success("Read it as Madrid → Lisbon, 12–16 Nov");
  };

  return (
    <form
      className="space-y-6 pb-28 md:pb-0"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {hack ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
          Starting from the <span className="font-medium">{hack.replaceAll("-", " ")}</span> guide.
          The search will still check every hack.
        </p>
      ) : null}
      <Tabs value={mode} onValueChange={(value) => setMode(value as TripMode)}>
        <TabsList className="h-12 w-full">
          <TabsTrigger value="quick" className="min-h-11">
            Quick Flight
          </TabsTrigger>
          <TabsTrigger value="full" className="min-h-11">
            Full Trip Plan
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "quick" ? (
        <div className="grid gap-3 sm:grid-cols-2">
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
          <label className="space-y-1.5 text-sm">
            <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">Cabin</span>
            <select
              value={cabin}
              onChange={(event) => setCabin(event.target.value as Cabin)}
              className="h-11 w-full rounded-xl border border-line bg-surface px-3"
              aria-label="Cabin"
            >
              <option value="economy">Economy</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
            </select>
          </label>
          <div className="self-end">
            <FlexibilityToggle enabled={flexOn} days={3} onChange={(next) => setFlexOn(next.enabled)} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <LegList legs={legs} onChange={setLegs} errors={errors.legs} />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLegs([...legs, blankLeg(legs.length + 1)])}
            >
              Add stop
            </Button>
            <TravellersStepper value={travellers} onChange={setTravellers} />
          </div>
          {errors.form ? <p className="text-sm text-risk">{errors.form}</p> : null}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-[20px] border border-line bg-paper p-4">
          <label htmlFor="booking-link" className="text-sm font-medium">
            Paste a booking link
          </label>
          <Input
            id="booking-link"
            className="mt-2"
            placeholder="https://…"
            value={link}
            onChange={(event) => setLink(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              if (!link.trim()) {
                setLinkNote("Paste a link first.");
                return;
              }
              setLinkNote("We read this as Madrid → Lisbon, 12–16 Nov. Confirm it below.");
              prefillSample();
            }}
          >
            Read the link
          </Button>
          {linkNote ? <p className="mt-2 text-xs text-ink-muted">{linkNote}</p> : null}
        </div>
        <ScreenshotDropzone onDetected={prefillSample} />
        <NaturalLanguageInput onInterpret={interpret} />
      </div>

      <div className="rounded-[20px] border border-line">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between px-4 text-left text-sm"
          aria-expanded={pointsOpen}
          onClick={() => setPointsOpen((open) => !open)}
        >
          Miles and points I already have
          <span className="text-ink-muted">{pointsOpen ? "Hide" : "Add"}</span>
        </button>
        {pointsOpen ? (
          <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2">
            {programs.map((program) => (
              <label key={program.id} className="text-sm">
                {program.name}
                <Input
                  className="mt-1"
                  inputMode="numeric"
                  placeholder="Balance"
                  aria-label={`${program.name} balance`}
                  value={balances[program.id] ?? ""}
                  onChange={(event) =>
                    setBalances((current) => ({ ...current, [program.id]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 z-20 border-t border-line bg-paper/95 p-3 md:static md:border-0 md:bg-transparent md:p-0" style={{ bottom: "calc(4.25rem + env(safe-area-inset-bottom))" }}>
        <Button type="submit" className="w-full md:w-auto">
          See the flipped fare
        </Button>
      </div>
    </form>
  );
}
