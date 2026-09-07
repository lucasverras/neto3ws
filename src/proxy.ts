import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

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
 */
function preferredLocale(request: NextRequest) {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    "/((?!_next|acervo/|images/|video/|fonts/|icon.png|apple-icon.png|favicon\\.ico|favicon-.*\\.png|icon-.*\\.png|apple-touch-icon\\.png|site\\.webmanifest|sitemap.xml|robots.txt).*)",
  ],
};
