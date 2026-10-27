import { loadEnvFiles } from './load-env.mjs'

loadEnvFiles()

function modeFromToken(token) {
  if (!token) return 'unknown'
  if (token.startsWith('duffel_test_')) return 'test'
  if (token.startsWith('duffel_live_')) return 'live'
  return 'unknown'
}

function dateAhead(days) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const key = process.env.DUFFEL_API_KEY
const mode = modeFromToken(key)
console.log(`data mode: ${mode}`)

if (!key) {
  console.error('check:duffel failed: missing key')
  process.exit(1)
}

const depart = dateAhead(30)
const body = {
  data: {
    cabin_class: 'economy',
    passengers: [{ type: 'adult' }],
    slices: [{ origin: 'LHR', destination: 'JFK', departure_date: depart }],
  },
}

try {
  const created = await fetch('https://api.duffel.com/air/offer_requests?return_offers=false&supplier_timeout=15000', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Duffel-Version': 'v2',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  })
  if (!created.ok) {
    console.error(`check:duffel failed: offer request ${created.status}`)
    process.exit(1)
  }
  const createdJson = await created.json()
  const requestId = createdJson.data?.id
  if (!requestId) {
    console.error('check:duffel failed: no offer request id')
    process.exit(1)
  }

  const listed = await fetch(
    `https://api.duffel.com/air/offers?offer_request_id=${encodeURIComponent(requestId)}&sort=total_amount&limit=50`,
    {
      headers: {
        Accept: 'application/json',
        'Duffel-Version': 'v2',
        Authorization: `Bearer ${key}`,
      },
    },
  )
  if (!listed.ok) {
    console.error(`check:duffel failed: list offers ${listed.status}`)
    process.exit(1)
  }
  const offers = (await listed.json()).data ?? []
  const cheapest = [...offers].sort((a, b) => Number.parseFloat(a.total_amount) - Number.parseFloat(b.total_amount))[0]
  console.log(`offer count: ${offers.length}`)
  if (cheapest) {
    console.log(`cheapest: ${cheapest.total_amount} ${cheapest.total_currency}`)
  }
  console.log('ok')
} catch {
  console.error('check:duffel failed')
  process.exit(1)
}
