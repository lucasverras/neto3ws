import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de leitura pública — chave anon, SEM cookies.
 *
 * O catálogo do site é igual para todo mundo, então ler sem sessão é o
 * correto: permite prerender/ISR de verdade (inclusive dentro de
 * `generateStaticParams` e do sitemap, onde `cookies()` não pode ser chamado)
 * e nunca mistura conteúdo de um usuário no cache da página. Quem filtra o
 * que é visível continua sendo a RLS da role `anon`.
 */
export function createPublicClient() {
  return createSupabaseClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
