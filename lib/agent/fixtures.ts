import type { AwardOption, WidgetPart } from "@/lib/agent/widgets";

const sampleSource = [{ label: "Invented sample", lastVerified: "2026-10-26" }];

function award(partial: Omit<AwardOption, "sample" | "sources" | "surcharges" | "cardFees"> & {
  surcharges?: number;
  cardFees?: number;
}): AwardOption {
  return {
    surcharges: 0,
    cardFees: 0,
    sample: true,
    sources: sampleSource,
    ...partial,
  };
}

export const jnbAwards: AwardOption[] = [
  award({
    id: "mad-jnb-iberia",
    origin: "Madrid",
    destination: "Johannesburg",
    originCode: "MAD",
    destinationCode: "JNB",
    depart: "2027-01-20",
    returnDate: "2027-02-03",
    cabin: "business",
    program: "Iberia Club",
    points: 85000,
    taxes: 214,
    surcharges: 98,
    seats: 2,
    cashPrice: 2140,
    verifiedMinutesAgo: 12,
    risk: "low",
    why: "An Iberia saver award covers the cabin. You pay taxes and fees, not the €2,140 ticket.",
  }),
  award({
    id: "mad-jnb-ba",
    origin: "Madrid",
    destination: "Johannesburg",
    originCode: "MAD",
    destinationCode: "JNB",
    depart: "2027-01-22",
    returnDate: "2027-02-04",
    cabin: "business",
    program: "British Airways Club",
    points: 90000,
    taxes: 260,
    surcharges: 168,
    seats: 1,
    cashPrice: 2380,
    verifiedMinutesAgo: 18,
    risk: "medium",
    why: "BA has a seat, but the award surcharge is higher. It still beats the cash fare.",
  }),
  award({
    id: "mad-jnb-qatar",
    origin: "Madrid",
    destination: "Johannesburg",
    originCode: "MAD",
    destinationCode: "JNB",
    depart: "2027-01-18",
    returnDate: "2027-02-02",
    cabin: "business",
    program: "Qatar Airways Privilege Club",
    points: 78000,
    taxes: 190,
    surcharges: 210,
    seats: 2,
    cashPrice: 2210,
    verifiedMinutesAgo: 25,
    risk: "high",
    why: "Fewer Avios, higher taxes. It only works if the Qatar account is already linked.",
  }),
];

export const balanceAwards: AwardOption[] = [
  award({
    id: "mad-lis-economy",
    origin: "Madrid",
    destination: "Lisbon",
    originCode: "MAD",
    destinationCode: "LIS",
    depart: "2026-12-04",
    returnDate: "2026-12-07",
    cabin: "economy",
    program: "Iberia Club",
    points: 18500,
    taxes: 64,
    seats: 4,
    cashPrice: 210,
    verifiedMinutesAgo: 9,
    risk: "low",
    why: "It fits inside 40,000 Avios and leaves a cushion. Cash is not expensive, but the award is clean.",
  }),
  award({
    id: "mad-fco-business",
    origin: "Madrid",
    destination: "Rome",
    originCode: "MAD",
    destinationCode: "FCO",
    depart: "2026-12-11",
    returnDate: "2026-12-15",
    cabin: "business",
    program: "Iberia Club",
    points: 52000,
    taxes: 112,
    seats: 1,
    cashPrice: 640,
    verifiedMinutesAgo: 14,
    risk: "medium",
    why: "You are 12,000 Avios short. Do not buy or transfer until this seat is pinned.",
  }),
];

export const nowAwards: AwardOption[] = [
  award({
    id: "mad-bcn-now",
    origin: "Madrid",
    destination: "Barcelona",
    originCode: "MAD",
    destinationCode: "BCN",
    depart: "2026-10-30",
    cabin: "economy",
    program: "Vueling Club",
    points: 15000,
    taxes: 42,
    seats: 3,
    cashPrice: 49,
    verifiedMinutesAgo: 6,
    risk: "low",
    why: "The cash fare is already cheap. Spending 15,000 Avios here is a bad trade.",
  }),
  award({
    id: "mad-lis-now",
    origin: "Madrid",
    destination: "Lisbon",
    originCode: "MAD",
    destinationCode: "LIS",
    depart: "2026-11-02",
    cabin: "economy",
    program: "Iberia Club",
    points: 22000,
    taxes: 71,
    seats: 2,
    cashPrice: 89,
    verifiedMinutesAgo: 8,
    risk: "low",
    why: "Points plus taxes are close to the cash price. Paying cash wins here.",
  }),
];

export function availabilityCells(base: number) {
  return Array.from({ length: 28 }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    const wave = [1, 0.9, 1.2, 0.8, 1.4, 1.1, 0.95][index % 7]!;
    return {
      date: `2027-01-${day}`,
      cabin: "business",
      points: Math.round(base * wave),
    };
  });
}

export const jnbStrategy: Extract<WidgetPart, { type: "strategy" }> = {
  type: "strategy",
  data: {
    goal: "Business class to South Africa in about 90 days",
    programs: ["Iberia Club", "British Airways Club"],
    earnMethod: "Spending you already do, plus a Revolut plan only if the math works",
    route: "Madrid → Johannesburg",
    nextStep: "Check availability and do not move Avios until the seat is visible",
    reminders: [
      "Earn from spending you were already going to do.",
      "Do not borrow or pay interest for points.",
      "Transfer only once the seat is in view.",
    ],
  },
};
