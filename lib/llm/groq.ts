import 'server-only'
import { z } from 'zod'

export const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const DEFAULT_GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'] as const

const TIMEOUT_MS = 12_000
const TEMPERATURE = 0.3
const MAX_TOKENS = 400

const replySchema = z.object({
  text: z.string().trim().min(1),
})

export type GroqChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type GroqCompleteResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'unconfigured' | 'failed' }

export function getGroqApiKey(): string | undefined {
  const key = process.env.GROQ_API_KEY
  return key && key.length > 0 ? key : undefined
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey())
}

export function parseGroqModels(value = process.env.GROQ_MODELS): string[] {
  const parts = (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length ? parts : [...DEFAULT_GROQ_MODELS]
}

function extractContent(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null
  const choices = (body as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) return null
  const message = (choices[0] as { message?: { content?: unknown } } | undefined)?.message
  const content = message?.content
  if (typeof content !== 'string') return null
  const trimmed = content.trim()
  return trimmed.length ? trimmed : null
}

function unwrapJson(content: string): unknown {
  const trimmed = content.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  const raw = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(raw) as unknown
}

function parseReplyText(content: string): string | null {
  try {
    const parsed = replySchema.safeParse(unwrapJson(content))
    return parsed.success ? parsed.data.text : null
  } catch {
    return null
  }
}

type AttemptKind = { kind: 'content'; text: string } | { kind: 'empty' } | { kind: 'next_model' }

async function completeOnce(model: string, messages: GroqChatMessage[], key: string): Promise<AttemptKind> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        messages,
      }),
    })
    if (res.status === 429 || res.status >= 500 || !res.ok) return { kind: 'next_model' }
    let body: unknown
    try {
      body = await res.json()
    } catch {
      return { kind: 'empty' }
    }
    const content = extractContent(body)
    if (!content) return { kind: 'empty' }
    return { kind: 'content', text: content }
  } catch {
    return { kind: 'next_model' }
  } finally {
    clearTimeout(timer)
  }
}

export async function completeGroqText(messages: GroqChatMessage[]): Promise<GroqCompleteResult> {
  const key = getGroqApiKey()
  if (!key) return { ok: false, reason: 'unconfigured' }

  const models = parseGroqModels()
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await completeOnce(model, messages, key)
      if (result.kind === 'next_model' || result.kind === 'empty') break
      const text = parseReplyText(result.text)
      if (text) return { ok: true, text }
    }
  }

  return { ok: false, reason: 'failed' }
}
