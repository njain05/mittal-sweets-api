// GET /api/revenue        -> today's revenue
// GET /api/revenue?days=7 -> last 7 days
//
// This is the homework endpoint: the API does real work, not just a
// pass-through. It filters by date, adds up qty * rate, and works out
// which item brought in the most.

import { supabase, configured } from "../lib/supabase.js";

// The shop is in Punjab, so "today" means today in IST — not in whatever
// timezone the server happens to run in. Vercel runs functions in UTC, so
// without this the day would start at 5:30am IST and early sales would be
// missed. IST is UTC+5:30 year round, no daylight saving.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istDayStart(daysBack) {
  const nowInIst = new Date(Date.now() + IST_OFFSET_MS);
  nowInIst.setUTCHours(0, 0, 0, 0);
  nowInIst.setUTCDate(nowInIst.getUTCDate() - daysBack);
  return {
    date: nowInIst.toISOString().slice(0, 10),        // the IST calendar date
    utc: new Date(nowInIst.getTime() - IST_OFFSET_MS) // same moment, as UTC
  };
}

export default async function handler(req, res) {
  if (!configured) {
    return res.status(500).json({
      error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY."
    });
  }

  // ?days=7 looks back a week. No param means today only.
  const days = Math.max(1, Number(req.query.days) || 1);
  const since = istDayStart(days - 1);

  const { data, error } = await supabase
    .from("sales")
    .select("item, qty, rate")
    .gte("sold_at", since.utc.toISOString());

  if (error) return res.status(500).json({ error: error.message });

  let total = 0;
  const byItem = {};

  for (const sale of data) {
    const amount = sale.qty * sale.rate;
    total += amount;
    byItem[sale.item] = (byItem[sale.item] || 0) + amount;
  }

  // Highest-earning item, or null if nothing sold.
  const ranked = Object.entries(byItem).sort((a, b) => b[1] - a[1]);
  const topItem = ranked.length
    ? { item: ranked[0][0], revenue: ranked[0][1] }
    : null;

  res.status(200).json({
    from: since.date,
    days,
    sales_count: data.length,
    total_revenue: Math.round(total * 100) / 100,
    top_item: topItem,
    by_item: Object.fromEntries(ranked)
  });
}
