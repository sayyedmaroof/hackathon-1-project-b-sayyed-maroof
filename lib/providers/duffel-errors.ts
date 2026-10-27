export type DuffelErrorBody = {
  status?: number
  request_id?: string
  errors?: {
    type?: string
    code?: string
    title?: string
    message?: string
  }[]
}

export class DuffelError extends Error {
  readonly status: number
  readonly type: string
  readonly code: string
  readonly requestId: string

  constructor(input: { status: number; type: string; code: string; message: string; requestId: string }) {
    super(input.message)
    this.name = 'DuffelError'
    this.status = input.status
    this.type = input.type
    this.code = input.code
    this.requestId = input.requestId
  }

  userMessage(): string {
    return userMessageForDuffel(this)
  }
}

export function parseDuffelError(status: number, body: unknown, requestIdHeader?: string | null): DuffelError {
  const parsed = (typeof body === 'object' && body ? body : {}) as DuffelErrorBody
  const first = parsed.errors?.[0]
  return new DuffelError({
    status,
    type: first?.type ?? 'api_error',
    code: first?.code ?? 'unknown',
    message: first?.message ?? first?.title ?? 'Duffel request failed',
    requestId: parsed.request_id ?? requestIdHeader ?? '',
  })
}

export function userMessageForDuffel(error: { status: number; type: string; code: string }): string {
  if (error.code === 'offer_expired' || error.code === 'offer_no_longer_available') {
    return 'This offer expired or is no longer available. Search again for current fares.'
  }
  if (error.type === 'validation_error' || error.code === 'validation_error') {
    return 'Check the passenger details and try again.'
  }
  if (error.code === 'insufficient_balance') {
    return 'There is not enough Duffel balance to complete this booking.'
  }
  if (error.code === 'rate_limit_exceeded' || error.type === 'rate_limit_error') {
    return 'Too many searches right now. Try again shortly.'
  }
  if (error.status === 504 || error.code === 'airline_internal') {
    return 'The airline timed out. Showing whatever results came back.'
  }
  if (error.code === 'missing_key') {
    return 'Cash fares are unavailable right now. Award options may still appear.'
  }
  return 'Cash search is unavailable. Award options may still appear.'
}

export function logDuffelError(error: DuffelError): void {
  console.error('Duffel request failed', {
    status: error.status,
    code: error.code,
    requestId: error.requestId,
  })
}
