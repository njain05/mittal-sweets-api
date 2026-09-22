// GET  /api/sales  -> every sale, newest first
// POST /api/sales  -> record a new sale
//
// Same idea as /api/orders in the session slides: one file, two methods,
// branching on req.method.

import { supabase, configured } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (!configured) {
    return res.status(500).json({
      error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY."
    });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("sales")
      .select("id, item, qty, unit, rate, sold_at")
      .order("sold_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // amount isn't stored — the API works it out.
    const sales = data.map(s => ({ ...s, amount: s.qty * s.rate }));
    return res.status(200).json(sales);
  }

  if (req.method === "POST") {
    const { item, qty, rate, unit = "kg" } = req.body ?? {};

    if (!item || qty == null || rate == null) {
      return res.status(400).json({ error: "item, qty and rate are required" });
    }

    const { data, error } = await supabase
      .from("sales")
      .insert([{ item, qty, rate, unit }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ ...data, amount: data.qty * data.rate });
  }

  res.status(405).json({ error: `${req.method} not allowed` });
}
