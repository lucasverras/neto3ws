import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Cliente com service role — IGNORA a RLS por completo.
 *
 * `server-only` garante erro de build se alguém importar isto de um componente
 * client. Use apenas onde realmente é preciso passar por cima da RLS: hoje,
 * só o script de importação do acervo legado.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
