const NEARBY: Record<string, string[]> = {
  MAD: ['BCN', 'VLC'],
  LHR: ['LGW'],
  LGW: ['LHR'],
}

export function nearbyAirports(code: string): string[] {
  return NEARBY[code.toUpperCase()] ?? []
}

export function expandAirport(code: string): string[] {
  const upper = code.toUpperCase()
  return [upper, ...nearbyAirports(upper)]
}
