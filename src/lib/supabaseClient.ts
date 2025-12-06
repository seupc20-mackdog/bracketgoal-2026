// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Se der problema de env, a gente vê um erro claro no log do browser.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase envs faltando: verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel."
  );
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
