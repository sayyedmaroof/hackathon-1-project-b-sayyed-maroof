import { z } from 'zod'
import type { SpendPlan } from '@/lib/plan/types'

const assignmentSchema = z.object({
  category: z.string().max(40),
  eur: z.number().finite(),
  cardName: z.string().max(120),
  points: z.number().finite(),
})

const unusedCardSchema = z.object({
  name: z.string().max(120),
  reason: z.string().max(400),
})

const suggestionSchema = z.object({
  kind: z.string().max(40),
  reason: z.string().max(800),
  delta: z.object({
    statusImproved: z.boolean(),
    netSavingEur: z.number().finite(),
  }),
})

export const planFactsSchema = z.object({
  tripLabel: z.string().max(200),
  origin: z.string().max(80),
  destination: z.string().max(80),
  cabin: z.string().max(40),
  travelDate: z.string().max(32),
  status: z.enum(['ready_now', 'on_track', 'short', 'unreachable']),
  message: z.string().max(1000),
  verdict: z.enum(['great', 'good', 'poor']),
  netSavingEur: z.number().finite(),
  cashSource: z.enum(['sample', 'duffel_live', 'duffel_test']),
  pointsRequired: z.number().finite(),
  reachableAtReadyBy: z.number().finite(),
  awardCurrency: z.string().max(40),
  shortfall: z.number().finite(),
  readyByDate: z.string().max(32),
  targetReachedDate: z.string().max(32).nullable(),
  usedUnverifiedData: z.boolean(),
  assignments: z.array(assignmentSchema).max(20),
  unusedCards: z.array(unusedCardSchema).max(20),
  suggestions: z.array(suggestionSchema).max(10),
})

export type PlanFacts = z.infer<typeof planFactsSchema>

export const planChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().trim().min(1).max(800),
})

export const planChatMessagesSchema = z
  .array(planChatMessageSchema)
  .min(1)
  .max(8)
  .refine((messages) => messages[messages.length - 1]?.role === 'user', {
    message: 'latest must be user',
  })

export const localeSchema = z.enum(['en', 'es'])

export function buildPlanFacts(input: {
  plan: SpendPlan
  tripLabel: string
  origin: string
  destination: string
  cabin: string
  travelDate: string
}): PlanFacts {
  const { plan } = input
  return {
    tripLabel: input.tripLabel,
    origin: input.origin,
    destination: input.destination,
    cabin: input.cabin,
    travelDate: input.travelDate,
    status: plan.status,
    message: plan.message,
    verdict: plan.verdict,
    netSavingEur: plan.netSavingEur,
    cashSource: plan.cashSource,
    pointsRequired: plan.pointsRequired,
    reachableAtReadyBy: plan.reachableAtReadyBy,
    awardCurrency: plan.awardCurrency,
    shortfall: plan.shortfall,
    readyByDate: plan.readyByDate,
    targetReachedDate:
      plan.targetReachedDate && plan.targetReachedDate <= input.travelDate ? plan.targetReachedDate : null,
    usedUnverifiedData: plan.usedUnverifiedData,
    assignments: plan.assignments.map((row) => ({
      category: row.category,
      eur: row.eur,
      cardName: row.cardName,
      points: row.pointsInTripCurrency,
    })),
    unusedCards: plan.unusedCards.map((row) => ({
      name: row.name,
      reason: row.reason,
    })),
    suggestions: plan.suggestions.map((row) => ({
      kind: row.kind,
      reason: row.reason,
      delta: {
        statusImproved: row.delta.statusImproved,
        netSavingEur: row.delta.netSavingEur,
      },
    })),
  }
}
