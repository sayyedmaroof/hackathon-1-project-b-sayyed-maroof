import type { MonthRow } from '@/lib/plan/types'

export function PointsChart({
  schedule,
  target,
}: {
  schedule: MonthRow[]
  target: number
}) {
  const width = 320
  const height = 140
  const pad = 16
  const max = Math.max(target, ...schedule.map((s) => s.cumulativePointsInTripCurrency), 1)
  const n = Math.max(schedule.length, 1)
  const points = schedule.map((row, i) => {
    const x = pad + (i / Math.max(n - 1, 1)) * (width - pad * 2)
    const y = height - pad - (row.cumulativePointsInTripCurrency / max) * (height - pad * 2)
    return `${x},${y}`
  })
  const targetY = height - pad - (target / max) * (height - pad * 2)

  const first = schedule[0]?.date.slice(0, 7) ?? ''
  const last = schedule[schedule.length - 1]?.date.slice(0, 7) ?? ''

  return (
    <svg viewBox={`0 0 ${width} ${height + 18}`} className="w-full" role="img" aria-label="Cumulative points versus target">
      <line x1={pad} x2={width - pad} y1={targetY} y2={targetY} stroke="#b86632" strokeDasharray="4 4" />
      {points.length > 1 ? (
        <polyline fill="none" stroke="#2a211b" strokeWidth="2" points={points.join(' ')} />
      ) : null}
      {schedule.map((row, i) => {
        const x = pad + (i / Math.max(n - 1, 1)) * (width - pad * 2)
        const y = height - pad - (row.cumulativePointsInTripCurrency / max) * (height - pad * 2)
        return <circle key={row.date} cx={x} cy={y} r="3" fill="#b86632" />
      })}
      {first ? (
        <text x={pad} y={height + 12} fontSize="12" fill="#4f433b">
          {first}
        </text>
      ) : null}
      {last && last !== first ? (
        <text x={width - pad} y={height + 12} fontSize="12" fill="#4f433b" textAnchor="end">
          {last}
        </text>
      ) : null}
    </svg>
  )
}
