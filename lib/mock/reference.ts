/** Published sample figures. Confirm against current terms before treating them as live. */

export const POINT_EURO_VALUE = 0.012;

export const revolutPlans = [
  {
    id: "premium" as const,
    monthlyFee: 9.99,
    debitEuroPerPoint: 4,
    creditPointsPerEuro: 0,
    source: "Revolut plan guide, sample",
    lastVerified: "2026-10-01",
  },
  {
    id: "metal" as const,
    monthlyFee: 15.99,
    debitEuroPerPoint: 2,
    creditPointsPerEuro: 0,
    source: "Revolut plan guide, sample",
    lastVerified: "2026-10-01",
  },
  {
    id: "ultra" as const,
    monthlyFee: 55,
    debitEuroPerPoint: 1,
    creditPointsPerEuro: 1.5,
    source: "Revolut plan guide, sample",
    lastVerified: "2026-10-01",
  },
];

export const shoppingMultiplier = {
  rate: 20,
  exampleSpend: 100,
  normalPoints: 100,
  boostedPoints: 2000,
  source: "Shopping multiplier, sample",
  lastVerified: "2026-10-01",
};

export const transferRules = {
  hub: "British Airways Club",
  partners: ["Iberia Club", "Vueling Club", "Aer Lingus", "Finnair", "Qatar Airways Privilege Club"],
  minAccountAgeDays: 30,
  qatarNeedsLink: true,
  source: "Avios transfer guide, sample",
  lastVerified: "2026-10-01",
};

/** Invented award sample used when a script has no bespoke itinerary. */
export const genericCashFare = {
  route: "MAD-LIS",
  cash: 415,
  points: 18500,
  taxes: 64,
  source: "Invented sample",
  lastVerified: "2026-10-26",
};
