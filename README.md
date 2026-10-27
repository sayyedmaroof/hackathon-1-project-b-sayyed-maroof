# FareFlip (A Una Milla)

Next.js flight search with sample awards, Duffel cash fares, auth, bookings, and a cards-and-points wallet layer.

## Cards and points sample data

Curated Spanish-market card and loyalty data lives under [`lib/cards/`](lib/cards/):

| File | Purpose |
|------|---------|
| [`catalog.ts`](lib/cards/catalog.ts) | Ten issuer products (nine cards + Revolut plan selector) |
| [`currencies.ts`](lib/cards/currencies.ts) | Point currencies and assumed `centsPerPoint` valuations |
| [`transfers.ts`](lib/cards/transfers.ts) | Transfer graph (Avios via BA bridge; Revolut/Amex edges marked unverified) |
| [`providers.ts`](lib/cards/providers.ts) | `CardCatalogProvider` / `BalanceProvider` interfaces |

**Verified today:** Revolut Premium/Metal/Ultra earn rates and monthly fees (see [`REVOLUT_PLAN_EARN`](lib/cards/catalog.ts)). **Everything else** in the catalog uses plausible placeholders with `verified: false` and must be checked against each issuer site.

**Replacing sample providers:** Implement `CardCatalogProvider` and load real balances via a `BalanceProvider` (e.g. AwardWallet or a bank API). Swap `defaultCardProviders` in [`lib/cards/providers.ts`](lib/cards/providers.ts) and keep wallet persistence in [`app/actions/wallet.ts`](app/actions/wallet.ts). All award planning runs server-side in [`lib/cards/plan.ts`](lib/cards/plan.ts).

Do not log wallet payloads or put balances in URLs.

## Duffel cash fares

Search creates an offer request with `return_offers=false`, then lists offers sorted by `total_amount`. Booking re-fetches the offer, pays the Duffel `total_amount` from that response, and sends `offer.passengers[].id` on each order passenger. Test tokens (`duffel_test_`) show sandbox fares; live tokens cannot create orders unless `DUFFEL_ALLOW_LIVE_BOOKING=true`.

`npm run check:duffel` prints only the data mode, offer count, and cheapest price. It never prints the API key.

### Test-mode routes (manual)

From [Duffel: Test your integration](https://duffel.com/docs/api/overview/test-your-integration). Use one-way searches:

| Scenario | Origin | Destination |
| --- | --- | --- |
| No offers | PVD | RAI |
| Supplier timeout | STN | LHR |
| Offer no longer available | LGW | LHR |
| Offer price change | LHR | STN |
| Order creation error | LHR | LGW |
| Insufficient balance | LGW | STN |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm test` — Vitest unit tests
- `npm run db:migrate` — apply Drizzle migrations
- `npm run check:duffel` — one Duffel test search (LHR–JFK, 30 days ahead)
