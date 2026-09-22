// One shared Supabase client, so every endpoint doesn't rebuild it.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

// Tells you clearly what's wrong instead of failing deep inside the library.
export const configured = Boolean(url && key);

export const supabase = configured ? createClient(url, key) : null;
