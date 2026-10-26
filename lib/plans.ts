export type PlanId = "free" | "pro" | "plus";

export type FarePlan = {
  id: PlanId;
  monthlyPrice: number;
  annualPrice: number;
  searches: number;
  horizonMonths: number;
  saved: number;
  alerts: boolean;
  refresh: "weekly" | "daily" | "hourly";
};

export const farePlans: FarePlan[] = [
  {
    id: "free",
    monthlyPrice: 0,
    annualPrice: 0,
    searches: 30,
    horizonMonths: 3,
    saved: 3,
    alerts: false,
    refresh: "weekly",
  },
  {
    id: "pro",
    monthlyPrice: 12,
    annualPrice: 108,
    searches: 150,
    horizonMonths: 12,
    saved: 25,
    alerts: true,
    refresh: "daily",
  },
  {
    id: "plus",
    monthlyPrice: 29,
    annualPrice: 276,
    searches: 500,
    horizonMonths: 18,
    saved: 100,
    alerts: true,
    refresh: "hourly",
  },
];

export function planById(id: PlanId) {
  return farePlans.find((plan) => plan.id === id) ?? farePlans[0]!;
}
