import type { CostLine, Hack, HeatCell, Option, Segment, TripQuery } from "@/lib/types";
import { airportByCode } from "@/lib/mock/airports";

const PRICED_AT = "2026-10-26T14:32:00+02:00";

const HEAT_DATES = [
  "2026-11-09",
  "2026-11-10",
  "2026-11-11",
  "2026-11-12",
  "2026-11-13",
  "2026-11-14",
  "2026-11-15",
  "2026-11-16",
  "2026-11-17",
  "2026-11-18",
  "2026-11-19",
  "2026-11-20",
  "2026-11-21",
  "2026-11-22",
];

function shift(from: string, to: string) {
  const raw = `${from}${to}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return raw % 37;
}

function city(code: string) {
  return airportByCode(code)?.city ?? code;
}

/** Keep every line at zero or above, and make the lines add up to the hacked price. */
function fitCosts(lines: CostLine[], target: number) {
  const delta = target - lines.reduce((sum, line) => sum + line.amount, 0);
  if (delta === 0) return;
  if (delta > 0) {
    const fare = lines.find((line) => line.kind === "fare");
    if (fare) fare.amount += delta;
    return;
  }
  const order = [
    ...lines.filter((line) => line.kind !== "fare").sort((a, b) => b.amount - a.amount),
    ...lines.filter((line) => line.kind === "fare"),
  ];
  let remaining = -delta;
  for (const line of order) {
    const cut = Math.min(line.amount, remaining);
    line.amount -= cut;
    remaining -= cut;
    if (remaining === 0) break;
  }
}

function costs(fare: number, bags: number, ground: number, taxes: number): CostLine[] {
  return [
    { label: "Fare", amount: fare, kind: "fare" },
    { label: "Bags", amount: bags, kind: "bags" },
    { label: "Ground transport", amount: ground, kind: "ground" },
    { label: "Taxes", amount: taxes, kind: "taxes" },
  ];
}

function segment(
  from: string,
  to: string,
  departAt: string,
  arriveAt: string,
  carrier: string,
  flightNumber: string,
  durationMinutes: number,
  layoverMinutes?: number,
): Segment {
  return { from, to, departAt, arriveAt, carrier, flightNumber, durationMinutes, layoverMinutes };
}

function heatmap(base: number, salt: number): HeatCell[] {
  const pattern = [1.15, 1.08, 0.92, 0.7, 0.74, 1.22, 1.28, 1.1, 0.88, 0.66, 0.72, 1.18, 1.3, 0.96];
  return HEAT_DATES.map((date, index) => ({
    date,
    price: Math.round(base * pattern[index]! + (salt % 9)),
  }));
}

function optionId(from: string, to: string, hack: Hack) {
  return `${from}~${to}~${hack}`;
}

type Template = Omit<Option, "id" | "origin" | "destination" | "heatmap" | "pricedAt" | "normalPrice" | "hackedPrice" | "saving" | "savingPct"> & {
  normal: number;
  hacked: number;
};

function templates(from: string, to: string, salt: number): Template[] {
  const depart = "2026-11-12";
  const normal = 380 + salt;
  const via = ["AMS", "CDG", "MAD", "LIS"].find((code) => code !== from && code !== to) ?? "BRU";
  return [
    {
      hacks: ["flexible-dates"],
      normal,
      hacked: Math.round(normal * 0.45),
      extraMinutes: -20,
      risk: "low",
      whyItWorks: "Thursday is priced like a different route. Friday, two days later, is not.",
      durationMinutes: 150,
      stops: 0,
      waitSignal: "book",
      legs: [
        segment(from, to, `${depart}T07:10:00+01:00`, `${depart}T09:40:00+00:00`, "Iberia", "IB 310", 150),
      ],
      costBreakdown: costs(Math.round(normal * 0.38), 28, 12, Math.round(normal * 0.07)),
      bestCard: {
        name: "Iberia Icon",
        pointsEarned: 740,
        euroValue: 9,
        reason: "You earn Avios on the operating carrier, and the fare is already low.",
      },
    },
    {
      hacks: ["nearby-airports"],
      normal,
      hacked: Math.round(normal * 0.62),
      extraMinutes: 45,
      risk: "low",
      whyItWorks: "The secondary airport is quieter, and the train into town is cheaper than the fare gap.",
      durationMinutes: 175,
      stops: 0,
      waitSignal: "wait",
      legs: [
        segment(from, to, `${depart}T11:20:00+01:00`, `${depart}T13:15:00+00:00`, "Vueling", "VY 846", 130),
      ],
      costBreakdown: costs(Math.round(normal * 0.48), 35, 22, Math.round(normal * 0.08)),
      bestCard: {
        name: "Revolut Metal",
        pointsEarned: 0,
        euroValue: 4,
        reason: "No foreign fee on the train ticket, which is part of the true total.",
      },
    },
    {
      hacks: ["split-ticket"],
      normal,
      hacked: Math.round(normal * 0.52),
      extraMinutes: 95,
      risk: "medium",
      whyItWorks: "The through-fare is protected. The two local tickets via a hub are not.",
      durationMinutes: 245,
      stops: 1,
      waitSignal: "book",
      legs: [
        segment(from, via, `${depart}T06:40:00+01:00`, `${depart}T08:05:00+01:00`, "Air Europa", "UX 1022", 85, 70),
        segment(via, to, `${depart}T09:15:00+01:00`, `${depart}T10:45:00+00:00`, "TAP", "TP 1016", 90),
      ],
      costBreakdown: costs(Math.round(normal * 0.4), 40, 18, Math.round(normal * 0.09)),
      bestCard: {
        name: "Amex Gold",
        pointsEarned: 1100,
        euroValue: 13,
        reason: "Two bookings still earn Membership Rewards if you pay with the card.",
      },
    },
    {
      hacks: ["stopover"],
      normal,
      hacked: Math.round(normal * 0.7),
      extraMinutes: 18 * 60,
      risk: "medium",
      whyItWorks: "The airline includes a night in its hub. You get a second city without a second fare.",
      durationMinutes: 210,
      stops: 1,
      waitSignal: "wait",
      legs: [
        segment(from, via, `${depart}T09:00:00+01:00`, `${depart}T10:20:00+00:00`, "TAP", "TP 1024", 140, 20 * 60),
        segment(via, to, "2026-11-13T08:40:00+00:00", "2026-11-13T12:10:00+01:00", "TAP", "TP 830", 150),
      ],
      costBreakdown: costs(Math.round(normal * 0.55), 0, 16, Math.round(normal * 0.1)),
      bestCard: {
        name: "TAP Miles&Go card",
        pointsEarned: 1600,
        euroValue: 16,
        reason: "The stopover is on TAP, so the operating carrier card earns the most.",
      },
    },
    {
      hacks: ["miles"],
      normal,
      hacked: 64,
      extraMinutes: 0,
      risk: "low",
      whyItWorks: "A saver award covers the seat. You pay the taxes, which is the number that matters.",
      durationMinutes: 155,
      stops: 0,
      waitSignal: "book",
      legs: [
        segment(from, to, `${depart}T16:05:00+01:00`, `${depart}T17:40:00+00:00`, "Iberia", "IB 318", 155),
      ],
      costBreakdown: costs(0, 0, 0, 64),
      bestCard: {
        name: "Iberia Icon",
        pointsEarned: 0,
        euroValue: 0,
        reason: "The seat is paid in Avios. Use the card only for the taxes if you want the insurance.",
      },
    },
    {
      hacks: ["transfer-partner"],
      normal,
      hacked: 71,
      extraMinutes: 30,
      risk: "high",
      whyItWorks: "Bank points move 1:1 into a program that has the seat. The cash fare never sees that price.",
      durationMinutes: 190,
      stops: 1,
      waitSignal: "book",
      legs: [
        segment(from, "CDG", `${depart}T13:10:00+01:00`, `${depart}T15:05:00+01:00`, "Air France", "AF 1401", 115, 55),
        segment("CDG", to, `${depart}T16:00:00+01:00`, `${depart}T17:20:00+00:00`, "Air France", "AF 1128", 80),
      ],
      costBreakdown: costs(0, 0, 0, 71),
      bestCard: {
        name: "Amex Platinum",
        pointsEarned: 0,
        euroValue: 0,
        reason: "Transfer Membership Rewards only after the award seat is on the screen.",
      },
    },
  ];
}

/** Build the six hack results for a query. Prices shift a little by route. */
export function buildOptions(query: TripQuery): Option[] {
  const from = (query.legs[0]?.from || "MAD").toUpperCase();
  const to = (query.legs[query.legs.length - 1]?.to || "LIS").toUpperCase();
  const salt = shift(from, to);
  const people = Math.max(1, query.travellers);

  return templates(from, to, salt).map((template) => {
    const hack = template.hacks[0]!;
    const normalPrice = template.normal * people;
    const hackedPrice = template.hacked * people;
    const saving = normalPrice - hackedPrice;
    const costBreakdown = template.costBreakdown.map((line) => ({
      ...line,
      amount: line.amount * people,
    }));
    fitCosts(costBreakdown, hackedPrice);
    return {
      id: optionId(from, to, hack),
      hacks: template.hacks,
      normalPrice,
      hackedPrice,
      saving,
      savingPct: Math.round((saving / normalPrice) * 100),
      extraMinutes: template.extraMinutes,
      risk: template.risk,
      whyItWorks: template.whyItWorks,
      legs: template.legs,
      costBreakdown,
      pricedAt: PRICED_AT,
      origin: city(from),
      destination: city(to),
      durationMinutes: template.durationMinutes,
      stops: template.stops,
      bestCard: template.bestCard,
      waitSignal: template.waitSignal,
      heatmap: hack === "flexible-dates" ? heatmap(template.hacked, salt) : undefined,
    };
  });
}

export function getMockOption(id: string): Option | null {
  const [from, to, hack] = id.split("~");
  if (!from || !to || !hack) return null;
  const options = buildOptions({
    mode: "quick",
    travellers: 1,
    cabin: "economy",
    flexDays: 0,
    legs: [{ id: "leg-1", from, to, depart: "2026-11-12" }],
  });
  return options.find((option) => option.id === id) ?? null;
}

/** Fixed examples for the landing showcase. SAMPLE FIGURES. */
export function showcaseOptions(): Option[] {
  const routes = [
    { from: "MAD", to: "LIS" },
    { from: "CDG", to: "FCO" },
    { from: "BER", to: "BCN" },
  ];
  return routes.map(({ from, to }) => {
    const options = buildOptions({
      mode: "quick",
      travellers: 1,
      cabin: "economy",
      flexDays: 3,
      legs: [{ id: "leg-1", from, to, depart: "2026-11-12" }],
    });
    return options[0]!;
  });
}
