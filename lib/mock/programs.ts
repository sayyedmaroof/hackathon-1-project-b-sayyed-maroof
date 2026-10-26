import type { LoyaltyProgram, TransferLink } from "@/lib/types";

/** Sample balances. Not connected to a real account. */
export const programs: LoyaltyProgram[] = [
  {
    id: "amex",
    name: "Membership Rewards",
    kind: "bank",
    balance: 38000,
    expiry: "No expiry",
    euroValue: 456,
    nextTripCost: 45000,
    unit: "points",
  },
  {
    id: "chase",
    name: "Ultimate Rewards",
    kind: "bank",
    balance: 22000,
    expiry: "While the card is open",
    euroValue: 264,
    nextTripCost: 30000,
    unit: "points",
  },
  {
    id: "iberia",
    name: "Iberia Plus",
    kind: "airline",
    balance: 14500,
    expiry: "2027-03-01",
    euroValue: 174,
    nextTripCost: 20000,
    unit: "Avios",
  },
  {
    id: "flying-blue",
    name: "Flying Blue",
    kind: "airline",
    balance: 8000,
    expiry: "2026-12-31",
    euroValue: 96,
    nextTripCost: 25000,
    unit: "miles",
  },
];

export const transfers: TransferLink[] = [
  { fromId: "amex", toId: "iberia", ratio: "1 : 1" },
  { fromId: "amex", toId: "flying-blue", ratio: "1 : 1" },
  { fromId: "chase", toId: "flying-blue", ratio: "1 : 1" },
];
