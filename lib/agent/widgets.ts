import { z } from "zod";

export const sourceSchema = z.object({
  label: z.string(),
  lastVerified: z.string(),
});

export const awardSchema = z.object({
  id: z.string(),
  origin: z.string(),
  destination: z.string(),
  originCode: z.string(),
  destinationCode: z.string(),
  depart: z.string(),
  returnDate: z.string().optional(),
  cabin: z.enum(["economy", "premium", "business"]),
  program: z.string(),
  points: z.number(),
  taxes: z.number(),
  surcharges: z.number(),
  cardFees: z.number(),
  cashPrice: z.number(),
  seats: z.number(),
  verifiedMinutesAgo: z.number(),
  risk: z.enum(["low", "medium", "high"]),
  why: z.string(),
  sample: z.literal(true),
  sources: z.array(sourceSchema),
});

export const strategySchema = z.object({
  goal: z.string(),
  programs: z.array(z.string()),
  earnMethod: z.string(),
  route: z.string(),
  nextStep: z.string(),
  reminders: z.array(z.string()).length(3),
});

export const widgetPartSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("strategy"), data: strategySchema, frozen: z.boolean().optional() }),
  z.object({ type: z.literal("award"), option: awardSchema, frozen: z.boolean().optional() }),
  z.object({
    type: z.literal("compare"),
    options: z.array(awardSchema).min(2).max(4),
    frozen: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("availability"),
    optionId: z.string(),
    month: z.string(),
    cells: z.array(z.object({ date: z.string(), cabin: z.string(), points: z.number() })),
    frozen: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("plans"),
    spend: z.number(),
    frozen: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("earn"),
    targetPoints: z.number(),
    ownedPoints: z.number(),
    monthlySpend: z.number(),
    targetDate: z.string(),
    extraSpend: z.boolean(),
    frozen: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("booster"),
    merchant: z.string(),
    multiplier: z.number(),
    spend: z.number(),
    expires: z.string(),
    lastVerified: z.string(),
    frozen: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("transfer"),
    fromProgram: z.string(),
    toProgram: z.string(),
    amount: z.number(),
    frozen: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("confirm"),
    action: z.enum(["transfer", "buy", "alert", "upgrade"]),
    reversible: z.boolean(),
    summary: z.string(),
    amountLabel: z.string(),
    frozen: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("usage"),
    used: z.number(),
    limit: z.number(),
    feature: z.string(),
    frozen: z.boolean().optional(),
  }),
]);

export type AwardOption = z.infer<typeof awardSchema>;
export type StrategyData = z.infer<typeof strategySchema>;
export type WidgetPart = z.infer<typeof widgetPartSchema>;

export function parseWidget(value: unknown): WidgetPart {
  return widgetPartSchema.parse(value);
}
