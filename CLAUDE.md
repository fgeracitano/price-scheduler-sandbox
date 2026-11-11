# CLAUDE.md

Guidance for anyone — human or AI agent — changing this repo. Read this before writing code.

## Commands

- `npm run dev` — API server (:4100) + app on http://localhost:5173
- `npm test` — Vitest (unit + component)
- `npm run lint` / `npm run typecheck` / `npm run build`

Run lint, typecheck and tests before considering a change done.

## Domain rules (non-negotiable)

- **Money is integer cents** (`Cents` in `src/lib/money.ts`) everywhere: API, state, arithmetic.
  Never do math on dollar floats; convert to/from dollars only when parsing input or formatting output.
- **Store time is `America/New_York`.** Merchandisers enter and read times in store time no matter
  where they are (the team is split between Boston and Dublin). Persist and send UTC ISO-8601 instants;
  convert only at the edges via `src/lib/time.ts`.
- **A price change window is half-open: `[startsAt, endsAt)`.** A change ending at 09:00 and another
  starting at 09:00 on the same product do not overlap.
- At most **one** price change may be active for a product at any instant.
- A scheduled price must be **greater than $0** and **lower than the base price**.

## Architecture

- Feature folders under `src/features/*`. Shared code goes in `src/lib`, `src/api`, `src/components`.
- **Server state goes through TanStack Query only.** No `fetch` in `useEffect`. Query keys come from the
  key factory in each feature's hooks file.
- After a mutation, **invalidate every query that renders the changed data.**
- Every API response is parsed with the Zod schemas in `src/api/schemas.ts`.
- **Never swallow errors.** A failed mutation keeps the form open and tells the user what went wrong.
- The mock API server (`server/`) must mirror the real API contract documented in the README.

## Testing

- Pure logic (`src/lib`, `overlap.ts`, `status.ts`) gets unit tests that cover edge cases: rounding,
  DST, boundaries.
- Components are tested through the UI with Testing Library against the real API app (bridged by MSW in
  `src/test/server.ts`) — do not mock `fetch` or our own hooks.
- A bug fix comes with a test that fails before the fix.

## Style

- TypeScript strict; no `any`.
- Named exports only.
- Prettier formats; don't hand-format.
