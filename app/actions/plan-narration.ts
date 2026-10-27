'use server'

import { z } from 'zod'
import { getClientIp } from '@/lib/auth/session'
import { completeGroqText, isGroqConfigured } from '@/lib/llm/groq'
import {
  localeSchema,
  planChatMessagesSchema,
  planFactsSchema,
  type PlanFacts,
} from '@/lib/llm/plan-facts'
import { allowNarrationCall } from '@/lib/plan/narration-rate-limit'

export type PlanNarrationResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'unconfigured' | 'rate_limited' | 'failed' }

const explainSchema = z.object({
  facts: planFactsSchema,
  locale: localeSchema,
})

const askSchema = z.object({
  facts: planFactsSchema,
  locale: localeSchema,
  messages: planChatMessagesSchema,
})

function systemPrompt(locale: 'en' | 'es', facts: PlanFacts, mode: 'summary' | 'chat'): string {
  const language = locale === 'es' ? 'Spanish' : 'English'
  const length =
    mode === 'summary'
      ? 'Write exactly two short sentences. Sentence 1: status, pointsRequired, reachableAtReadyBy, shortfall, and readyByDate. Sentence 2: netSavingEur versus cash, plus at most one suggestion.'
      : 'Keep the reply under about 80 words and stay on this plan.'
  return [
    'You rewrite a computed spend plan into plain language.',
    'Use only the JSON facts below. Copy numbers exactly; do not invent monthly earn totals, award seats, or prices.',
    'Do not mention months or years after readyByDate unless targetReachedDate is set.',
    'If a figure is missing, say so.',
    'This is not financial advice.',
    'When usedUnverifiedData is true, say the rates are illustrative.',
    'Do not tell the user to book.',
    `Reply in ${language}.`,
    length,
    'Return a JSON object {"text": string} and nothing else.',
    'Facts:',
    JSON.stringify(facts),
  ].join('\n')
}

async function runNarration(
  facts: PlanFacts,
  locale: 'en' | 'es',
  mode: 'summary' | 'chat',
  history: { role: 'user' | 'assistant'; text: string }[] = [],
): Promise<PlanNarrationResult> {
  if (!isGroqConfigured()) return { ok: false, reason: 'unconfigured' }
  const ip = await getClientIp()
  if (!allowNarrationCall(ip)) return { ok: false, reason: 'rate_limited' }

  const messages = [
    { role: 'system' as const, content: systemPrompt(locale, facts, mode) },
    ...history.map((turn) => ({
      role: turn.role,
      content: turn.text,
    })),
  ]

  if (mode === 'summary') {
    messages.push({
      role: 'user',
      content: 'Write the 2–4 sentence summary of this plan.',
    })
  }

  const result = await completeGroqText(messages)
  if (!result.ok) return { ok: false, reason: result.reason }
  return { ok: true, text: result.text }
}

export async function explainPlan(input: { facts: PlanFacts; locale: 'en' | 'es' }): Promise<PlanNarrationResult> {
  const parsed = explainSchema.safeParse(input)
  if (!parsed.success) return { ok: false, reason: 'failed' }
  return runNarration(parsed.data.facts, parsed.data.locale, 'summary')
}

export async function askPlan(input: {
  facts: PlanFacts
  locale: 'en' | 'es'
  messages: { role: 'user' | 'assistant'; text: string }[]
}): Promise<PlanNarrationResult> {
  const parsed = askSchema.safeParse(input)
  if (!parsed.success) return { ok: false, reason: 'failed' }
  return runNarration(parsed.data.facts, parsed.data.locale, 'chat', parsed.data.messages)
}
