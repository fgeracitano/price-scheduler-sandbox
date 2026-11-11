# Price Scheduler (sandbox)

Sandbox app for front-end interviews. An internal tool where merchandisers schedule temporary price
changes for products. All data is fictional; the API is a small local server that keeps data in memory.

## Run it

Requires Node 22+.

```bash
npm install
npm run dev
```

Open http://localhost:5173. This starts the app (Vite) and the API server (http://localhost:4100/api).
Data resets when the server restarts.

```bash
npm test            # tests
npm run lint        # lint
npm run typecheck   # types
```

## UI

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Price Scheduler                                      Store time: Wed, Nov 11, 5:39 AM ET │
├────────────────────────────────────────────────────────────┬─────────────────────────────┤
│ Products                                    200 products   │ Scheduled changes           │
│ ┌─────────────────────────────┐ ┌────────────────┐         │ ┌──────┬──────────┬───────┐ │
│ │ Search name, SKU or brand   │ │ All categories▾│         │ │Live 2│Upcoming 2│Expired│ │
│ └─────────────────────────────┘ └────────────────┘         │ └──────┴──────────┴───────┘ │
│ SKU       PRODUCT          PRICE    LIVE                   │ ┌─────────────────────────┐ │
│ BOO-1000  Ankle Boot       $336.99  $269.59  [Schedule]    │ │ Suede High-Top SNE-1013 │ │
│ SNE-1001  Mesh High-Top    $114.99  —        [Schedule]    │ │ $146.99 → $102.89  −30% │ │
│ BAG-1002  Weekender        $682.00  —        [Schedule]    │ │ Fri 9:00 AM → Mon 9:00  │ │
│ ACC-1005  Card Holder       $53.50  —        [Schedule]    │ │ "Weekend flash sale"    │ │
│ …                                                          │ │ [Cancel]                │ │
│                                                            │ └─────────────────────────┘ │
└────────────────────────────────────────────────────────────┴─────────────────────────────┘

Clicking [Schedule] on a row opens a drawer on the right:

                              ┌───────────────────────────────────────┐
                              │ Schedule price change               × │
                              │ Cashmere Card Holder · ACC-1005       │
                              │ current $53.50                        │
                              │ ┌ New price ──────────────────────┐   │
                              │ │ (•) % off   ( ) Fixed price     │   │
                              │ │ Discount (%)  [ 20          ]   │   │
                              │ └─────────────────────────────────┘   │
                              │ ┌ When (store time, ET) ──────────┐   │
                              │ │ Starts [2026-11-12] [09:00]     │   │
                              │ │ Ends   [2026-11-14] [09:00]     │   │
                              │ └─────────────────────────────────┘   │
                              │ Note (optional) [               ]     │
                              │ ┌─────────────────────────────────┐   │
                              │ │ $53.50 → $42.80  −20%           │   │
                              │ │ Thu, Nov 12, 9:00 AM ET → …     │   │
                              │ └─────────────────────────────────┘   │
                              │                [Cancel] [Schedule]    │
                              └───────────────────────────────────────┘
```

## API

| Method   | Path                         | Description             |
| -------- | ---------------------------- | ----------------------- |
| `GET`    | `/api/products?q=&category=` | Product catalog         |
| `GET`    | `/api/schedules?productId=`  | Scheduled price changes |
| `POST`   | `/api/schedules`             | Create a price change   |
| `DELETE` | `/api/schedules/:id`         | Cancel a price change   |

Money is integer cents, times are UTC ISO-8601. Schemas are in `src/api/schemas.ts`.

Like a real service, the server adds 150–900 ms latency and fails 10% of writes. Turn that off with
`LATENCY=0 FAILURE_RATE=0 npm run dev`.

## Stack

React 19, TypeScript, Vite, TanStack Query, Zod, Hono (API server), Vitest, Testing Library, MSW (tests).

## Structure

```
server/         API server: routes, in-memory store, seed data
src/api/        HTTP client, Zod schemas, endpoints
src/features/   products and schedules UI, hooks, logic
src/lib/        money and time helpers, shared hooks
src/test/       test setup
```

Conventions and domain rules: [`CLAUDE.md`](./CLAUDE.md).
