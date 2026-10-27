const DUFFEL_BASE = 'https://api.duffel.com'

export async function duffelFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.DUFFEL_API_KEY
  if (!key) throw new Error('DUFFEL_API_KEY is not set')
  const res = await fetch(`${DUFFEL_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Duffel-Version': 'v2',
      Authorization: `Bearer ${key}`,
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Duffel error ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}
