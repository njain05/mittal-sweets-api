# Mittal Sweets — API

**Live: [mittal-sweets-api.vercel.app](https://mittal-sweets-api.vercel.app)**

Session 7 homework for the Punjab Jobs AI Bootcamp. Plain Node.js serverless
functions on Vercel, backed by Supabase.

A sweet shop needs one number every evening: what did we take today, and what
sold best. That's what `/api/revenue` answers. The page at the root links to
every endpoint with a Fetch button so you can see the JSON without a terminal.

## Endpoints

| Route | Method | What it does |
|---|---|---|
| `/api/revenue` | GET | Today's total revenue and top-earning item. `?days=7` widens the window. |
| `/api/sales` | GET | Every sale, newest first, with the amount worked out. |
| `/api/sales` | POST | Records a sale. Body: `{ item, qty, rate, unit? }` |
| `/api/hello` | GET | A greeting and the server time. Proves the pipeline works. |

Revenue is never stored — it's recalculated from the rows on every call. POST a
sale, refresh, and the total moves. Nothing to keep in sync.

The shop is in Punjab, so "today" is pinned to IST rather than the server's
timezone. Vercel runs functions in UTC; without that, the day would start at
5:30am IST and early sales would fall out of the total.

## Running it locally

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase values
node dev.js                        # http://localhost:3000
```

`dev.js` mimics Vercel's file-based routing, so no CLI or account is needed to
test. It isn't used in production.

## Database

Paste [`db/schema.sql`](db/schema.sql) into the Supabase SQL Editor. It creates
the `sales` table, seeds a dozen rows, and — importantly — adds the row-level
security policies. Without those policies the API returns an empty array and
looks broken.

Seed timestamps are relative to `now()`, so today's revenue is never zero.
