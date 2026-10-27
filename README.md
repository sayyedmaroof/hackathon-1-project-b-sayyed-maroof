# FareFlip

A spend-planning guide for travellers in Spain. Pick the cards you already have, pick a sample trip and date, enter balances and monthly spend, and get a month-by-month plan for which card to use so points are ready before you fly. The app does **not** search award seats and does **not** book flights. You book later, when the points are ready.

The guest flow works with no login and no network call. Duffel is optional enrichment: a read-only cash fare for the selected trip and date, used as the cash baseline of net saving (“what you avoid paying”).

## Hardcoded data

| File | What it holds |
|------|----------------|
| [`lib/cards/catalog.ts`](lib/cards/catalog.ts) | Nine Spain-market cards (ids unchanged). Spanish copy from [A una milla de tu destino](https://aunamilladetudestino.com/tarjetas-de-credito/), English summaries, official apply URLs, local images under `public/cards/`. |
| [`lib/cards/transfers.ts`](lib/cards/transfers.ts) | Transfer graph (Avios family via BA, 1:1 verified). Revolut and Amex edges are unverified. |
| [`lib/cards/currencies.ts`](lib/cards/currencies.ts) | Assumed cents-per-point. |
| [`lib/trips/catalog.ts`](lib/trips/catalog.ts) | Sample Madrid trips, including Johannesburg business. Points, taxes and `typicalCashEur` are **sample** values. |

Earn rates, caps, fees and welcome bonuses (except Revolut) are commented ASSUMPTIONS with `verified: false`. The website publishes none of those numbers.

Refresh card images with `node scripts/fetch-card-images.mjs` (confirm you are allowed to reuse those images before a public launch).

## Data provenance

| Data | Status |
|------|--------|
| Revolut Premium / Metal / Ultra earn and fees | Verified (our guide): 1 pt per €4 / €2 / €1; Ultra credit 1.5 per €1; fees €9.99 / €15.99 / €55 |
| Other card earn, caps, fees, welcome bonuses | Illustrative. Shown with “Illustrative rates, verify with the issuer” |
| Avios ↔ BA transfer edges | Verified 1:1 (accounts 30 days old, matching personal details) |
| Revolut / Amex transfer edges | Unverified |
| Sample trips, award charts, `typicalCashEur` | Illustrative |
| Duffel live fare (`duffel_live_` key) | Real published cash fare for that trip and date |
| Duffel test fare (`duffel_test_` key) | Sandbox only; displayed, never used in net saving or ranking |
| Groq plan copy (`GROQ_API_KEY`) | Optional. Rewrites the computed plan into a summary and chat answers. Missing key, rate limit, or model failure leaves the result tables as they are. Groq never changes net saving or status. |

## How to swap in real data later

- **Balances:** keep [`app/actions/wallet.ts`](app/actions/wallet.ts) and replace the guest/local numbers with AwardWallet or a bank API behind `BalanceProvider` in [`lib/cards/providers.ts`](lib/cards/providers.ts).
- **Card earn:** replace the assumption block in [`lib/cards/catalog.ts`](lib/cards/catalog.ts) and set `verified: true` per issuer.
- **Award availability:** a real award API is the next product step. This version never searches award seats.

Do not put Duffel keys, offer ids, passenger data or raw Duffel payloads in client code, localStorage, URLs or logs.

## Duffel (read-only cash baseline)

Duffel is **not** called from a search page. [`getCashBaseline`](app/actions/cash-baseline.ts) fetches one trip and one date (catalog origin, destination, cabin, journey only). The cheapest EUR offer may replace `typicalCashEur` **only** when the token is live, the cabin and journey match, and the fare is less than 24 hours old.

- Test tokens (`duffel_test_`) may show “Test data: sandbox fares, not real prices” and **must never** change net saving, verdict or trip ranking.
- Any failure (no key, timeout, rate limit, empty offers, non-EUR, 4xx/5xx) degrades to the sample baseline plus “Live fare unavailable, using a sample estimate”.
- `npm run check:duffel` prints data mode, offer count and cheapest price. It never prints the API key.
- `DUFFEL_ALLOW_LIVE_BOOKING` still gates the **parked** cash-booking path (`bookCashOffer` in [`app/actions/booking.ts`](app/actions/booking.ts), [`lib/booking`](lib/booking), `/bookings`). That UI is not linked from the planner or the nav in this version. Existing bookings remain viewable by URL.

### Test-mode routes (manual)

From [Duffel: Test your integration](https://duffel.com/docs/api/overview/test-your-integration). One-way searches:

| Scenario | Origin | Destination |
| --- | --- | --- |
| No offers | PVD | RAI |
| Supplier timeout | STN | LHR |
| Offer no longer available | LGW | LHR |
| Offer price change | LHR | STN |
| Order creation error | LHR | LGW |
| Insufficient balance | LGW | STN |

## Database

The Neon client in [`lib/db/index.ts`](lib/db/index.ts) is created on first use. Importing it never throws. `getCurrentUser` returns null when there is no session cookie and also returns null if the database is unreachable (it logs a message without secrets). Guest routes (`/`, `/plan`, `/login`, `/signup`) render with no `DATABASE_URL` and no `DUFFEL_API_KEY`. `/plans` redirects to login.

Migrations are append-only. Older tables (`searches`, booking `award_guide` provider) remain in the schema and are unused by the new flow. `saved_plans` stores trip, date, ready-by days, **server-computed** net saving, cash source, fetchedAt, and an `inputs` JSON snapshot (card ids, balances, spend) so a plan can be reopened. No offer ids.

## Language

UI copy lives in [`lib/i18n`](lib/i18n) (`en` and `es`). English is the default. The header has an ES/EN toggle that sets `document.documentElement.lang`.

## Legal

[`/privacy`](app/privacy/page.tsx) and [`/terms`](app/terms/page.tsx) cover illustrative rates, guest localStorage, account data, and Duffel as a cash-fare source only.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build (must pass with no env vars; try `env -u DATABASE_URL -u DUFFEL_API_KEY npm run build`)
- `npm test` — Vitest
- `npm run db:migrate` — apply Drizzle migrations
- `npm run check:duffel` — one Duffel test search (LHR–JFK, 30 days ahead)

## What’s next (demo)

- Real award availability API
- Live balances (AwardWallet or issuer)
- Notifications when the ready-by date is at risk
- Optional cash booking from the plan when points are not worth it
