import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "owner";
}

/**
 * Quem está logado E é administrador de verdade.
 *
 * Duas checagens, não uma:
 *   1. `getUser()` valida o token contra o servidor do Supabase. `getSession()`
 *      só lê o cookie, que é forjável — nunca serve para autorizar.
 *   2. O UUID precisa constar em `admin_users`. Ter conta no Auth não dá
 *      acesso ao estoque; a RLS aplica a mesma regra no Postgres, então nem
 *      uma requisição montada à mão passa por cima disto.
 *
 * Memoizado por request: o layout, a página e a action consultam sem que isso
 * vire três idas ao Supabase.
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id, email, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.user_id,
      email: data.email ?? user.email ?? "",
      role: data.role === "owner" ? "owner" : "admin",
    };
  } catch {
    return null;
  }
});

export class NotAuthorizedError extends Error {
  constructor() {
    super("Sua sessão expirou ou você não tem permissão para esta ação.");
    this.name = "NotAuthorizedError";
  }
}

/**
 * Porta de entrada de toda mutação do estoque.
 *
 * Devolve o cliente já ligado à sessão do admin, para que a escrita vá ao
 * banco com a identidade certa e a RLS possa conferi-la.
 */
export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new NotAuthorizedError();
  return { admin, supabase: await createClient() };
}
