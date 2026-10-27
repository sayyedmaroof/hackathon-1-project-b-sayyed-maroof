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

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm test` — Vitest unit tests
- `npm run db:migrate` — apply Drizzle migrations
