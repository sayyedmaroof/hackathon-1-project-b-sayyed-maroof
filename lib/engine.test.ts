import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultProviders, defaultSearch, sampleFlights } from './data.ts'
import { parseTripIntent } from './intent.ts'
import { aviosShortfall, revolutEarn, revolutPointsForSpend } from './loyalty.ts'
import { calculateSavings } from './savings.ts'
import { activeFilterCount, applyFilters, defaultFilters, flexibleDays, priceStep, searchFlights, validateSearch } from './search.ts'
import type { LoyaltyProgram, SearchQuery } from './types.ts'

const madridNewYork: SearchQuery = {
  ...defaultSearch,
  origin: 'Madrid (MAD)',
  destination: 'New York (JFK)',
  depart: '2027-05-12',
  returnDate: '2027-05-19',
  cabin: 'Business',
}

describe('validateSearch', () => {
  it('accepts a known route with a return on or after departure', () => {
    assert.deepEqual(validateSearch(madridNewYork), {})
  })

  it('requires two different known airports and a valid date range', () => {
    const errors = validateSearch({
      ...madridNewYork,
      origin: '',
      destination: 'ZZZ',
      depart: '12 May 2027',
      returnDate: '2027-05-01',
    })
    assert.equal(errors.origin, 'Enter an origin airport.')
    assert.equal(errors.destination, 'Enter a known airport code or city.')
    assert.equal(errors.depart, 'Enter a departure date.')

    const same = validateSearch({ ...madridNewYork, destination: 'Madrid (MAD)' })
    assert.equal(same.destination, 'Choose a different destination.')

    const order = validateSearch({ ...madridNewYork, returnDate: '2027-05-01' })
    assert.equal(order.returnDate, 'Return date must be on or after departure.')
  })
})

describe('sample providers', () => {
  it('returns route-keyed rows without relabeling', () => {
    const rows = defaultProviders.flight.search({ from: 'MAD', to: 'JFK', cabin: 'Business' })
    assert.equal(rows.length, 3)
    assert.ok(rows.every((flight) => flight.from === 'MAD' && flight.to === 'JFK'))
    assert.deepEqual(defaultProviders.award.search({ from: 'MAD', to: 'DOH', cabin: 'Business' }), [])
  })
})

describe('searchFlights', () => {
  it('returns the real Madrid–New York sample and nothing for an unknown pair', () => {
    const found = searchFlights(madridNewYork, 'Business')
    assert.equal(found.length, 3)
    assert.ok(found.every((flight) => flight.from === 'MAD' && flight.to === 'JFK'))

    const empty = searchFlights({ ...madridNewYork, destination: 'Doha (DOH)' })
    assert.deepEqual(empty, [])
  })

  it('does not relabel a flight onto a route it does not fly', () => {
    const lisbon = searchFlights({ ...madridNewYork, destination: 'Lisbon (LIS)', cabin: 'Economy' }, 'Economy')
    assert.ok(lisbon.length > 0)
    assert.ok(lisbon.every((flight) => flight.to === 'LIS'))
    assert.equal(lisbon.some((flight) => flight.id.startsWith('ib-business')), false)
  })

  it('shifts cash, fees, and points by a deterministic day offset', () => {
    const step = priceStep('2027-05-12')
    const base = sampleFlights.find((flight) => flight.id === 'ib-business')
    const shifted = searchFlights(madridNewYork, 'Business').find((flight) => flight.id.startsWith('ib-business'))
    assert.ok(base && shifted)
    assert.equal(shifted?.cash, Math.max(50, base.cash + step * 40))
    assert.equal(shifted?.fees, Math.max(15, base.fees + step * 10))
    assert.equal(shifted?.points, Math.max(1000, base.points + step * 2000))
  })
})

describe('flexibleDays', () => {
  it('builds a week around departure and prices each day against the selected one', () => {
    const days = flexibleDays(madridNewYork, 'Business')
    assert.equal(days.length, 7)
    assert.equal(days[3]?.date, '2027-05-12')
    assert.equal(days[3]?.delta, 0)

    for (const day of days) {
      const best = Math.max(...searchFlights({ ...madridNewYork, depart: day.date }, 'Business').map((flight) => calculateSavings(flight).netSaving))
      const selected = Math.max(...searchFlights(madridNewYork, 'Business').map((flight) => calculateSavings(flight).netSaving))
      assert.equal(day.delta, Math.round(best - selected))
    }

    assert.ok(days.some((day) => day.delta !== 0))
  })
})

describe('applyFilters', () => {
  it('counts filters that differ from the defaults and narrows the rows', () => {
    const flights = searchFlights(madridNewYork, 'Business')
    assert.equal(activeFilterCount(defaultFilters), 0)
    const nonstop = { ...defaultFilters, stops: 'nonstop' as const }
    assert.equal(activeFilterCount(nonstop), 1)
    const filtered = applyFilters(flights, nonstop)
    assert.ok(filtered.length > 0)
    assert.ok(filtered.every((flight) => flight.stops === 'Nonstop'))
  })
})

describe('parseTripIntent', () => {
  it('reads a destination, cabin, budget, month, and points balance', () => {
    const intent = parseTripIntent('Business class to Tokyo in May under €1,000 with 90,000 points')
    assert.equal(intent.destination, 'HND')
    assert.equal(intent.cabin, 'Business')
    assert.equal(intent.budgetEuro, 1000)
    assert.equal(intent.when, 'May')
    assert.equal(intent.pointsBalance, 90000)
    assert.deepEqual(intent.missing, [])
  })

  it('asks for the first gap when the message is only a city', () => {
    const intent = parseTripIntent('I want to go to Lisbon')
    assert.equal(intent.destination, 'LIS')
    assert.equal(intent.missing[0], 'cabin')
  })

  it('keeps Narita and Cape Town on their own airport codes', () => {
    assert.equal(parseTripIntent('Narita in autumn').destination, 'NRT')
    assert.equal(parseTripIntent('Cape Town this summer').destination, 'CPT')
  })
})

describe('avios shortfall', () => {
  const programs: LoyaltyProgram[] = [
    { id: 'iberia', name: 'Iberia Avios', balance: 10_000, unit: 'Avios', note: '' },
    { id: 'ba', name: 'British Airways Avios', balance: 2_000, unit: 'Avios', note: '' },
    { id: 'qatar', name: 'Qatar Privilege Club', balance: 50_000, unit: 'Avios', note: '' },
  ]

  it('pools Iberia and British Airways and leaves Qatar separate', () => {
    const covered = aviosShortfall(12_000, programs)
    assert.equal(covered.canBook, true)
    assert.equal(covered.message, 'You can book this today')
    assert.equal(covered.buyNote, false)

    const close = aviosShortfall(17_000, programs)
    assert.equal(close.short, 5_000)
    assert.equal(close.message, 'You are short 5,000 Avios')
    assert.equal(close.buyNote, true)

    const far = aviosShortfall(17_001, programs)
    assert.equal(far.short, 5_001)
    assert.equal(far.buyNote, false)

    const qatar = aviosShortfall(60_000, programs, 'qatar')
    assert.equal(qatar.short, 10_000)
    assert.equal(qatar.balance, 50_000)
  })
})

describe('revolut earn math', () => {
  it('converts monthly spend and a cash fare at the plan rate', () => {
    assert.deepEqual(revolutEarn(800, 'Premium'), { perMonth: 200, perYear: 2400 })
    assert.deepEqual(revolutEarn(800, 'Metal'), { perMonth: 400, perYear: 4800 })
    assert.deepEqual(revolutEarn(800, 'Ultra'), { perMonth: 800, perYear: 9600 })
    assert.equal(revolutPointsForSpend(2500, 'Ultra'), 2500)
    assert.equal(revolutPointsForSpend(2500, 'Metal'), 1250)
    assert.equal(revolutPointsForSpend(2500, 'Premium'), 625)
  })
})
