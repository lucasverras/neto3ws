import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import { isAdminPath, updateAdminSession } from "@/lib/supabase/proxySession";

/**
 * Manda qualquer URL sem prefixo de idioma para a versão certa.
 *
 *   /                → /pt        (ou o idioma do visitante)
 *   /estoque         → /pt/estoque
 *   /estoque/copo-…  → /pt/estoque/copo-…   (URLs antigas continuam resolvendo)
 *
 * A ordem de decisão é: cookie gravado pelo seletor → pt. Quando não há cookie,
 * o redirecionamento é permanente para que robôs consolidem sinais na URL
 * canônica em vez de manterem variantes legadas sem idioma no índice.
 *
 * O painel (`/admin`) fica inteiramente fora dessa regra: é ferramenta
 * interna, só em português, e não tem versão por idioma. Em vez de ganhar
 * prefixo, ele passa pela renovação de sessão do Supabase.
 */
function preferredLocale(request: NextRequest) {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  return DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Antes de qualquer coisa de idioma: o painel tem o seu próprio ciclo.
  if (isAdminPath(pathname)) return updateAdminSession(request);

  if (pathname === "/links" || pathname.startsWith("/links/")) return;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, isLocale(fromCookie) ? 307 : 308);
}

export const config = {
  // Fora: assets do Next, derivativos do acervo, ícones e os metadados que
  // precisam viver na raiz (sitemap.xml, robots.txt).
  matcher: [
    "/((?!_next|acervo/|images/|video/|fonts/|icon.png|apple-icon.png|favicon\\.ico|favicon-.*\\.png|icon-.*\\.png|apple-touch-icon\\.png|site\\.webmanifest|sitemap.xml|robots.txt|llms.txt).*)",
  ],
};
