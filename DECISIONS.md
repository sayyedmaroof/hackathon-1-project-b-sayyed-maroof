# Decisions

Product calls made while building the Fareflip preview.

- The headline is “Same trip. Far less to pay.” “Check a trip” scrolls to the search card. “See how it works” scrolls to the steps.
- Copy stays in English. Money is formatted with `es-ES`. Stored prices are euros. GBP and USD in the footer are sample rates (0.86 and 1.08) and never rewrite the data.
- Login and signup are visual. Submitting shows a toast and opens the planner. Nothing is gated.
- Those screens sit in the marketing group, outside the site navbar, so the split layout stays intact.
- The command palette is mounted once at the root, so it works on marketing pages and in the product.
- Trip legs can be dragged, and they also have up and down buttons.
- Forms are validated in `lib/validate-query.ts`. There is no schema library.
- Low risk uses ink. Medium uses the warn colour. High uses the risk colour. Green is only for money saved.
- A trip page reads the sample catalog first. If the id is only in a saved snapshot, the client renders that. Otherwise it shows the empty state.
- Stats, testimonials, the ticker, FX rates and prices are sample figures. The UI says so, and the source comments say so.
- Search streams from `lib/api/search.ts` through `/api/search`. Replacing the generator is the path to a real API.
- Saved trips and settings live in `localStorage`.
- `cacheComponents` stays on. Runtime values such as the clock and theme stay on the client. The artificial search delay stays in the route handler.
