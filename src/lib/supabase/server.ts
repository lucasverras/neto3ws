import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de servidor (Server Components, Route Handlers, Server Actions).
 *
 * Chave anon + cookie de sessão do visitante: anônimo enxerga só o que a RLS
 * libera para `anon`; admin logado enxerga o que a RLS libera para ele. Nada
 * de service role aqui.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component não pode escrever cookie: o proxy já renova a
          // sessão a cada request, então dá para ignorar com segurança.
        }
      },
    },
  });
}
