import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { completeGroqText, parseGroqModels, DEFAULT_GROQ_MODELS } from './groq'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function groqText(text: string) {
  return jsonResponse(200, {
    choices: [{ message: { content: JSON.stringify({ text }) } }],
  })
}

describe('Groq client', () => {
  const env = { ...process.env }

  beforeEach(() => {
    process.env.GROQ_API_KEY = 'gsk_test_unit'
    process.env.GROQ_MODELS = 'openai/gpt-oss-120b,openai/gpt-oss-20b'
  })

  afterEach(() => {
    process.env = { ...env }
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('parses the model list and uses defaults when empty', () => {
    expect(parseGroqModels('openai/gpt-oss-120b, openai/gpt-oss-20b')).toEqual([
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
    ])
    expect(parseGroqModels('')).toEqual([...DEFAULT_GROQ_MODELS])
    expect(parseGroqModels(undefined)).toEqual([...DEFAULT_GROQ_MODELS])
  })

  it('does not call the network when the key is missing', async () => {
    delete process.env.GROQ_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const result = await completeGroqText([{ role: 'user', content: 'hi' }])
    expect(result).toEqual({ ok: false, reason: 'unconfigured' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls through from a 500 on the first model to { text } on the second', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(500, { error: 'boom' }))
      .mockResolvedValueOnce(groqText('On track with a net saving.'))
    vi.stubGlobal('fetch', fetchMock)
    const result = await completeGroqText([{ role: 'user', content: 'summarise' }])
    expect(result).toEqual({ ok: true, text: 'On track with a net saving.' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const firstBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))
    expect(firstBody.model).toBe('openai/gpt-oss-120b')
    expect(secondBody.model).toBe('openai/gpt-oss-20b')
  })

  it('retries invalid JSON on the same model then falls through', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { choices: [{ message: { content: 'not-json' } }] }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { choices: [{ message: { content: '{"nope":true}' } }] }),
      )
      .mockResolvedValueOnce(groqText('Fallback summary'))
    vi.stubGlobal('fetch', fetchMock)
    const result = await completeGroqText([{ role: 'user', content: 'summarise' }])
    expect(result).toEqual({ ok: true, text: 'Fallback summary' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not log the API key or raw response body', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(500, { secret: 'gsk_test_unit', raw: 'payload' }))
      .mockResolvedValueOnce(groqText('ok'))
    vi.stubGlobal('fetch', fetchMock)
    await completeGroqText([{ role: 'user', content: 'summarise' }])
    const dumped = [...log.mock.calls, ...error.mock.calls, ...warn.mock.calls, ...info.mock.calls]
      .flat()
      .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ')
    expect(dumped).not.toContain('gsk_test_unit')
    expect(dumped).not.toContain('payload')
  })
})
