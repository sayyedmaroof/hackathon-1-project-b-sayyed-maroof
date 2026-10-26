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

- English is the default locale, with no prefix. Spanish is available at `/es`.
- The live tagline is “Turn the fare around.” The Spanish options stay on record: “Dale la vuelta a la tarifa.”, “La tarifa, del revés.”, “Voltea la tarifa.”
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
- The demo person is Marta, in Madrid. No real consultant names, emails, or account numbers.
- Marketing stills in `public/images` are Pexels photos. Credits live in `lib/photos.ts`. The landing page does not use them.
- The agent never asks for a loyalty password. Balances are typed in by hand.

## Gate and cleanup

- A transfer or points purchase stays locked until availability is confirmed and the person checks that it cannot be undone. The browser asserts the gate; a real backend must check it again before moving points.
- The landing hero is a scripted chat. Cash flips into points plus taxes, and that page has no stock photo.
- Assistant messages can be copied, regenerated, or shared. Regenerate replaces the last reply instead of adding another.
- The old cash-search controls and the `fareflip:saved-trips` and `fareflip:preferences` keys are gone. Saved trips live on the `fareflip:v2` board.

## Accounts

- Accounts live in Neon Postgres. The Drizzle schema in `lib/db/schema.ts` is the source of the SQL migrations in `drizzle/`.
- A session is an httpOnly cookie named `ff_session`. The database stores a hash of the token, not the token itself. The same is true for verification and reset links.
- Verification and password reset mail goes through Brevo. Without `BREVO_API_KEY`, development prints the link instead of sending it.
- A profile stores language (`en` or `es`) and a home airport. Profile reads and writes take the user id from the session. Chats, the trip board, and the wallet stay in `fareflip:v2`.
- The product shell stays open without an account. Saving a profile requires a session.
