import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";

export const ADMIN_LOGIN_PATH = "/admin/login";

/** Rotas do painel que podem ser abertas sem sessão. */
const PUBLIC_ADMIN_PATHS = new Set([ADMIN_LOGIN_PATH, "/admin/recuperar", "/admin/nova-senha"]);

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Renova a sessão do Supabase a cada request e barra o /admin de quem não está
 * logado.
 *
 * Esta é a checagem *otimista* recomendada pelo Next: ela evita que a tela do
 * painel chegue a renderizar para um visitante sem sessão, mas não é a
 * autorização de verdade. Quem autoriza é `requireAdmin()`
 * (src/lib/admin/auth.ts), que confere o UUID na tabela `admin_users` — e a
 * RLS no Postgres, que recusa a escrita mesmo que alguém burle o resto.
 */
export async function updateAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const needsSession = isAdminPath(pathname) && !PUBLIC_ADMIN_PATHS.has(pathname);

  // Sem credenciais configuradas não há como validar sessão nenhuma: fecha o
  // painel em vez de deixar passar (fail closed).
  if (!hasSupabaseEnv()) {
    if (needsSession) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.search = "";
      url.searchParams.set("erro", "config");
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalida o token no servidor do Supabase; getSession() apenas lê
  // o cookie, que dá para forjar. Em rota protegida, sempre getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsSession && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    url.search = "";
    // Só caminhos internos voltam no `next`: um destino absoluto viraria
    // redirecionamento aberto depois do login.
    if (isAdminPath(pathname)) url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === ADMIN_LOGIN_PATH && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
