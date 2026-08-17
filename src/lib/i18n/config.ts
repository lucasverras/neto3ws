/** Idiomas do site. Português é o padrão — a 3WS atende primariamente o Brasil. */

export const LOCALES = ["pt", "en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";

/** Rótulo curto do seletor (canto superior direito). */
export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "PORT",
  en: "ENG",
  es: "ESP",
};

/** Nome por extenso, usado em aria-label e no hreflang. */
export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

/** Valor do atributo lang / hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

/** Locale do Open Graph. */
export const OG_LOCALES: Record<Locale, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

/** Cookie onde o seletor guarda a escolha, lido pelo proxy nas visitas seguintes. */
export const LOCALE_COOKIE = "3ws_locale";

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

/**
 * Todas as rotas são prefixadas (`/pt`, `/en`, `/es`), inclusive o padrão.
 * Simetria evita URL duplicada para o mesmo conteúdo e mantém o hreflang
 * trivial de gerar. A raiz `/` é redirecionada pelo proxy.
 */
export function localePath(locale: Locale, path = "/") {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Remove o prefixo de idioma de um pathname: `/en/estoque` → `/estoque`. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/);
  if (match && isLocale(match[1])) {
    return pathname.slice(match[1].length + 1) || "/";
  }
  return pathname;
}
