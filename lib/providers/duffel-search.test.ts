import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDuffelOrder, getDuffelOffer, offerRequestBody, searchDuffelCash } from './duffel'
import { setDuffelSleep } from './duffel-client'
import offerGet from './__fixtures__/offer-get.json'
import offerList from './__fixtures__/offer-list.json'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

describe('Duffel search and order payloads', () => {
  const env = { ...process.env }

  beforeEach(() => {
    process.env.DUFFEL_API_KEY = 'duffel_test_unit'
    process.env.DUFFEL_ALLOW_LIVE_BOOKING = 'true'
    setDuffelSleep(async () => undefined)
  })

  afterEach(() => {
    process.env = { ...env }
    vi.unstubAllGlobals()
  })

  it('builds one slice for one-way and two for a return', () => {
    const oneWay = offerRequestBody({
      origin: 'LHR',
      destination: 'JFK',
      departDate: '2027-06-01',
      cabin: 'Economy',
      adults: 1,
    })
    expect(oneWay.data.slices).toHaveLength(1)
    const round = offerRequestBody({
      origin: 'LHR',
      destination: 'JFK',
      departDate: '2027-06-01',
      returnDate: '2027-06-10',
      cabin: 'Economy',
      adults: 2,
    })
    expect(round.data.slices).toHaveLength(2)
    expect(round.data.passengers).toHaveLength(2)
    expect(round.data.cabin_class).toBe('economy')
  })

  it('does not call Duffel when origin equals destination', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const offers = await searchDuffelCash({
      origin: 'BCN',
      destination: 'BCN',
      departDate: '2027-05-13',
      returnDate: '2027-05-21',
      cabin: 'Business',
      adults: 1,
    })
    expect(offers).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates an offer request then lists offers sorted by total_amount', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: { id: 'orq_test' } }))
      .mockResolvedValueOnce(jsonResponse(200, offerList))
    vi.stubGlobal('fetch', fetchMock)
    const offers = await searchDuffelCash({
      origin: 'LHR',
      destination: 'JFK',
      departDate: '2027-06-01',
      returnDate: '2027-06-10',
      cabin: 'Economy',
      adults: 1,
    })
    expect(offers[0]?.cashPrice).toBe(120.5)
    const urls = fetchMock.mock.calls.map((call) => String(call[0]))
    expect(urls[0]).toContain('/air/offer_requests?return_offers=false')
    expect(urls[1]).toContain('sort=total_amount')
    expect(urls[1]).toContain('offer_request_id=orq_test')
  })

  it('pays the freshly fetched amount and sends offer passenger ids', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, offerGet))
      .mockResolvedValueOnce(jsonResponse(201, { data: { id: 'ord_1', booking_reference: 'ABC123' } }))
    vi.stubGlobal('fetch', fetchMock)
    const fresh = await getDuffelOffer('off_test_cheapest')
    const order = await createDuffelOrder(
      {
        offerId: 'off_test_cheapest',
        passengers: [
          {
            givenName: 'Ada',
            familyName: 'Lovelace',
            email: 'ada@example.com',
            phone: '+442080160509',
            bornOn: '1980-07-24',
            gender: 'f',
          },
        ],
      },
      fresh,
    )
    expect(order.bookingRef).toBe('ABC123')
    const body = JSON.parse(String(fetchMock.mock.calls[1][1].body))
    expect(body.data.passengers[0].id).toBe('pas_test_1')
    expect(body.data.payments[0]).toEqual({ type: 'balance', currency: 'EUR', amount: '120.50' })
    expect(body.data.type).toBe('instant')
  })

  it('refuses live booking unless the allow flag is set', async () => {
    process.env.DUFFEL_API_KEY = 'duffel_live_unit'
    delete process.env.DUFFEL_ALLOW_LIVE_BOOKING
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      createDuffelOrder(
        {
          offerId: 'off_x',
          passengers: [
            {
              givenName: 'Ada',
              familyName: 'Lovelace',
              email: 'ada@example.com',
              phone: '+442080160509',
              bornOn: '1980-07-24',
              gender: 'f',
            },
          ],
        },
        { id: 'off_x', totalAmount: '10.00', totalCurrency: 'EUR', passengerIds: ['pas_1'] },
      ),
    ).rejects.toThrow('Live booking is disabled')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
