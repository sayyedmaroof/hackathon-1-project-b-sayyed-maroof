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

/** Nearby airports that are not the other end of the trip (Duffel rejects origin === destination). */
export function nearbySearchAirports(code: string, otherEnd: string): string[] {
  const other = otherEnd.toUpperCase()
  return nearbyAirports(code).filter((airport) => airport !== other)
}
