# Fareflip v2 plan

Spanish-first chat agent on top of the existing design system. No real LLM, award, or payment calls.

## What stays

`Logo`, `ThemeToggle`, `BoardingPassCard`, `FlipNumber`, `CountUp`, `RouteMap`, `Timeline`, `EmptyState`, `Section`, `Container`, `Marquee`, `RiskLabel`, `WhyItWorks`, `SkeletonResult`, `PriceAlertToggle` (alerts gated by plan), tokens, fonts, theme, reduced-motion rules, `siteConfig`.

## What changes

- Navbar and mobile tabs: Chat, Trips, Earn, Wallet. Pricing lives in the navbar and the user menu.
- Command palette: Nuevo chat, Ir al tablero, Cambiar a modo Plan/Ahora, Ir a Earn.
- `PriceCompare` flips cash into points plus taxes. `SavingsBadge` only for a verified cash minus points-and-taxes saving.
- `TotalCostBreakdown` lists points, taxes, surcharges, and card fees.
- `PriceHeatmap` powers `AvailabilityCalendar`.
- Wallet cards and the transfer diagram become the British Airways hub, with link status.
- `BookingStepper` becomes `TransferStepper`.
- Saved trips become the itinerary library. The counter is estimated points value versus cash.
- `ScreenshotDropzone` moves into the composer.
- `/hacks` stays as learn content linked from answers, not as result cards.
- `/trip/[id]` is an award itinerary with a readiness checklist and a gated transfer.
- `/plan` is the classic form. Submit opens a new chat with those values as the first message.
- `/results` redirects to `/chat`.

## What is removed

- Hero search card. The search card remains only on `/plan`.
- `NaturalLanguageInput`.
- `TimeValueSlider` and effort ranking. Now mode does not use them.
- Cycling cash showcase. The six-tile hack bento shrinks to one cash tile.
- `searchTrips`, `/api/search`, and hack-option mocks once nothing imports them. One cash fare sample stays in `lib/mock/reference.ts`.
- Old `localStorage` keys. New data uses `fareflip:v2`. Stale keys are ignored.

## What is new

`next-intl` (`es` default, `en` at `/en/...`), zod widget schemas, `runAgent` plus `useChat`, chat shell, Trip Board, `/earn`, `/pricing`, usage meter, mock Stripe unlock, `DisclosureNote`, `SourcesFooter`, `/dev/widgets`, and Vitest tests for the gates.

## v1 gap audit

| Check | Result |
| --- | --- |
| Light and dark mode intentional | Pass on the pages reviewed in v1. Re-checked with the v2 screens. |
| Reduced motion, including FlipNumber crossfade | Pass. CSS and `useReducedMotion` already cover the flap, count-up, marquee, and route dash. |
| No horizontal scroll at 375, 768, 1280, 1536; 44px targets; safe-area tab bar | Pass on the v1 landing. v2 chat, board, and composer use the same rules. |
| Designed loading, error, and not-found per route group | Pass. Root, marketing, and app groups. |
| Metadata, Open Graph, favicon, app icons | Pass. |
| Keyboard access, focus rings, icon labels, heading order | Pass for the shell. Icon-only controls keep `aria-label`. |
| Intl money formatting and tabular numerals | Pass via `formatMoney` / `formatCount` and `.num`. |
| Sample-data notes and `siteConfig` as the only name and tagline | Pass. The badge is `SampleNote`, gated by `lib/mock/flag.ts`. |
| Landing Lighthouse ≥ 95 | Not measured in this environment (no Lighthouse run). Fonts use `next/font`. Known gap below. |
| lint, tsc, next build | Re-run at the end of v2. |
| DECISIONS.md | Updated for v2. |

## Known gaps

- Lighthouse was not executed here. The landing page avoids image layout shift and uses `next/font`.
- English and Spanish message files cover the product UI. A few internal code comments stay in English.
