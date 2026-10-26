# Decisions

Product calls for the Fareflip preview.

## v1

- The first headline was “Same trip. Far less to pay.”
- Login and signup are visual. Nothing was gated in v1.
- Those screens sit outside the marketing navbar.
- The command palette is mounted once inside the locale layout.
- Low risk uses ink. Medium uses warn. High uses risk. Green is only for money saved.
- `cacheComponents` stays on. Runtime clocks and theme stay on the client.
- Saved data lives in `localStorage`.

## v2

- Fareflip is a Spanish-first award-travel agent. Default locale is `es`. English is `en`, prefixed (`/en/chat`). Spanish URLs stay unprefixed.
- Tagline options: “Dale la vuelta a la tarifa.”, “La tarifa, del revés.”, “Voltea la tarifa.” The product uses **Dale la vuelta a la tarifa.**
- Money is EUR via `Intl.NumberFormat("es-ES")`. The GBP/USD footer switch is gone.
- `next-intl` is the i18n layer. The html document lives in `app/[locale]/layout.tsx`, so `locale` is a root param and `i18n/request.ts` can read `next/root-params`. Prerender does not call `cookies()`. `localeDetection` is off, so a first visit stays in Spanish.
- `runAgent` is the only agent function a real backend replaces. The mock runs in the client so prerender never waits on a stream.
- Widget payloads are a zod discriminated union. Numbers on screen come from that data, not from prose.
- Transfer and buy-points stay disabled until an availability widget is in the thread and the user confirms. The rule lives in `lib/agent/gates.ts`.
- `TimeValueSlider` is removed. Now mode compares cash against points plus taxes instead of ranking by the value of an hour.
- `/results` redirects to `/chat`. `/plan` stays as a classic form that starts a chat.
- `/plan` is a short form that opens a chat. The old cash search controls are not on that page.
- Hacks stay as learn pages. They are not result cards.
- New storage key is `fareflip:v2`. Older saved-trip and preference keys are ignored.
- Plans are Free, Pro, and Plus. Checkout is a mock modal. There are no card fields.
- Alerts require a paid plan.
- Sample figures carry a source and a last-verified date. `lib/mock/flag.ts` is the switch for the “Datos de ejemplo” badge.
- The demo person is Marta, in Madrid. No real consultant names, emails, account numbers, or marketing images.
- The agent never asks for a loyalty password. Balances are typed in by hand.
