import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

/**
 * Manda qualquer URL sem prefixo de idioma para a versão certa.
 *
 *   /                → /pt        (ou o idioma do visitante)
 *   /estoque         → /pt/estoque
 *   /estoque/copo-…  → /pt/estoque/copo-…   (URLs antigas continuam resolvendo)
 *
 * A ordem de decisão é: cookie gravado pelo seletor → Accept-Language → pt.
 * É redirect, e não rewrite, para que cada idioma tenha uma URL única e o
 * conteúdo não seja indexado em dois endereços.
 */
function preferredLocale(request: NextRequest) {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const header = request.headers.get("accept-language");
  if (header) {
    const ranked = header
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=");
        return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of ranked) {
      const base = tag.split("-")[0];
      if (isLocale(base)) return base;
    }
  }

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Fora: assets do Next, derivativos do acervo, ícones e os metadados que
  // precisam viver na raiz (sitemap.xml, robots.txt).
  matcher: [
    "/((?!_next|acervo/|images/|video/|fonts/|icon.png|apple-icon.png|sitemap.xml|robots.txt).*)",
  ],
};
