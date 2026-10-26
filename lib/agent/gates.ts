import { POINT_EURO_VALUE, revolutPlans } from "@/lib/mock/reference";

export type RevolutPlanId = (typeof revolutPlans)[number]["id"];

export function monthlyPoints(planId: RevolutPlanId, monthlySpend: number, useCredit = false) {
  const plan = revolutPlans.find((item) => item.id === planId)!;
  if (useCredit && plan.creditPointsPerEuro > 0) {
    return Math.round(monthlySpend * plan.creditPointsPerEuro);
  }
  return Math.round(monthlySpend / plan.debitEuroPerPoint);
}

export function netAnnualValue(planId: RevolutPlanId, monthlySpend: number, useCredit = false) {
  const plan = revolutPlans.find((item) => item.id === planId)!;
  const points = monthlyPoints(planId, monthlySpend, useCredit) * 12;
  return Math.round(points * POINT_EURO_VALUE - plan.monthlyFee * 12);
}

/** Highest net value. A negative result means no plan pays for itself. */
export function recommendPlan(monthlySpend: number) {
  const rows = revolutPlans.map((plan) => {
    const useCredit = plan.creditPointsPerEuro > 0;
    return { id: plan.id, net: netAnnualValue(plan.id, monthlySpend, useCredit), useCredit };
  });
  const best = [...rows].sort((a, b) => b.net - a.net)[0]!;
  if (best.net <= 0) return { id: null as RevolutPlanId | null, net: best.net, rows };
  return { id: best.id, net: best.net, rows };
}

export function pointsGap(target: number, owned: number) {
  return Math.max(0, Math.round(target - owned));
}

const SMALL_BUY = 15000;

type TransferGateInput = {
  availabilityShown: boolean;
  userConfirmed: boolean;
  acknowledged: boolean;
};

export function transferAllowed(input: TransferGateInput) {
  return input.availabilityShown && input.userConfirmed && input.acknowledged;
}

/**
 * Throws when the transfer gate is closed.
 * A real backend must re-check this server-side before moving points.
 */
export function assertTransferAllowed(input: TransferGateInput) {
  if (!transferAllowed(input)) {
    throw new Error("Transfer is not allowed");
  }
}

export function buyPointsAllowed(input: TransferGateInput & { gapPoints: number }) {
  return (
    transferAllowed(input) && input.gapPoints > 0 && input.gapPoints <= SMALL_BUY
  );
}

export type UsageLevel = "ok" | "warn" | "blocked";

export function usageLevel(used: number, limit: number): UsageLevel {
  if (limit <= 0) return "blocked";
  if (used >= limit) return "blocked";
  if (used / limit >= 0.8) return "warn";
  return "ok";
}

export function horizonAllowed(monthsAhead: number, horizonMonths: number) {
  return monthsAhead <= horizonMonths;
}
