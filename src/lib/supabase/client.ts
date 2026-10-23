"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente do browser — SEMPRE com a chave anon. Quem decide o que pode ser
 * lido ou escrito é a RLS no Postgres, nunca o frontend.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
