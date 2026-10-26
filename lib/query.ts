import type { Cabin, Leg, ProgramBalance, TripMode, TripQuery } from "@/lib/types";

const CABINS: Cabin[] = ["economy", "premium", "business"];

function isCabin(value: string | null): value is Cabin {
  return CABINS.includes(value as Cabin);
}

function readJson<T>(value: string | null): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

/** Turn a trip query into a shareable search string. */
export function serializeTripQuery(query: TripQuery) {
  const params = new URLSearchParams();
  params.set("mode", query.mode);
  params.set("travellers", String(query.travellers));
  params.set("cabin", query.cabin);
  params.set("flex", String(query.flexDays));

  const first = query.legs[0];
  if (first) {
    params.set("from", first.from);
    params.set("to", first.to);
    if (first.depart) params.set("depart", first.depart);
    if (first.returnDate) params.set("return", first.returnDate);
  }

  if (query.mode === "full") {
    params.set("legs", JSON.stringify(query.legs));
  }

  if (query.programs?.length) {
    params.set("programs", JSON.stringify(query.programs));
  }

  return params.toString();
}

/** Parse a query string. Returns null when the payload is not a trip. */
export function parseTripQuery(search: string | URLSearchParams): TripQuery | null {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  if (!params.get("from") && !params.get("legs")) return null;

  const modeParam = params.get("mode");
  const mode: TripMode = modeParam === "full" ? "full" : "quick";
  const cabin = isCabin(params.get("cabin")) ? (params.get("cabin") as Cabin) : "economy";
  const travellers = Number(params.get("travellers") ?? "1");
  const flexDays = Number(params.get("flex") ?? "0");

  const encodedLegs = readJson<Leg[]>(params.get("legs"));
  const legs: Leg[] =
    encodedLegs?.length
      ? encodedLegs
      : [
          {
            id: "leg-1",
            from: (params.get("from") ?? "").toUpperCase(),
            to: (params.get("to") ?? "").toUpperCase(),
            depart: params.get("depart") ?? "",
            returnDate: params.get("return") ?? undefined,
          },
        ];

  return {
    mode: mode as TripMode,
    legs,
    travellers: Number.isFinite(travellers) ? travellers : 1,
    cabin,
    flexDays: Number.isFinite(flexDays) ? flexDays : 0,
    programs: readJson<ProgramBalance[]>(params.get("programs")),
  };
}

export function resultsHref(query: TripQuery) {
  return `/results?${serializeTripQuery(query)}`;
}

export function planHref(query?: Partial<TripQuery> & { hack?: string }) {
  if (!query) return "/plan";
  const params = new URLSearchParams();
  if (query.hack) params.set("hack", query.hack);
  if (query.mode) params.set("mode", query.mode);
  const first = query.legs?.[0];
  if (first?.from) params.set("from", first.from);
  if (first?.to) params.set("to", first.to);
  if (first?.depart) params.set("depart", first.depart);
  const search = params.toString();
  return search ? `/plan?${search}` : "/plan";
}
