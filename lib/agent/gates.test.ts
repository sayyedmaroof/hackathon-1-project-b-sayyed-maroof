import { describe, expect, it } from "vitest";
import {
  assertTransferAllowed,
  buyPointsAllowed,
  monthlyPoints,
  netAnnualValue,
  recommendPlan,
  transferAllowed,
  usageLevel,
} from "@/lib/agent/gates";

const closed = { availabilityShown: false, userConfirmed: false, acknowledged: false };

describe("transfer and buy gates", () => {
  it("keeps a transfer locked until availability is shown, confirmed, and acknowledged", () => {
    expect(transferAllowed({ ...closed })).toBe(false);
    expect(transferAllowed({ availabilityShown: true, userConfirmed: false, acknowledged: true })).toBe(false);
    expect(transferAllowed({ availabilityShown: false, userConfirmed: true, acknowledged: true })).toBe(false);
    expect(transferAllowed({ availabilityShown: true, userConfirmed: true, acknowledged: false })).toBe(false);
    expect(transferAllowed({ availabilityShown: true, userConfirmed: true, acknowledged: true })).toBe(true);
  });

  it("throws when a transfer is not allowed", () => {
    expect(() => assertTransferAllowed(closed)).toThrow(/not allowed/);
  });

  it("allows a points purchase only for a small confirmed gap", () => {
    const open = { availabilityShown: true, userConfirmed: true, acknowledged: true };
    expect(buyPointsAllowed({ ...open, gapPoints: 12000 })).toBe(true);
    expect(buyPointsAllowed({ ...open, gapPoints: 45000 })).toBe(false);
    expect(buyPointsAllowed({ ...open, gapPoints: 0 })).toBe(false);
    expect(
      buyPointsAllowed({ availabilityShown: false, userConfirmed: true, acknowledged: true, gapPoints: 12000 }),
    ).toBe(false);
  });
});

describe("plan math", () => {
  it("does not recommend a plan when every net value is negative", () => {
    expect(recommendPlan(1500).id).toBeNull();
    expect(netAnnualValue("ultra", 1500, true)).toBeLessThanOrEqual(0);
  });

  it("counts debit points from the published rate", () => {
    expect(monthlyPoints("premium", 400)).toBe(100);
    expect(monthlyPoints("metal", 400)).toBe(200);
    expect(monthlyPoints("ultra", 400, true)).toBe(600);
  });
});

describe("usage", () => {
  it("warns at 80 percent and blocks at the limit", () => {
    expect(usageLevel(18, 30)).toBe("ok");
    expect(usageLevel(24, 30)).toBe("warn");
    expect(usageLevel(30, 30)).toBe("blocked");
  });
});
