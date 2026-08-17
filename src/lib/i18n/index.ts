import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { pt, type Dictionary } from "./dictionaries/pt";
import type { Locale } from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { pt, en, es };

/**
 * Os três dicionários são estáticos e pequenos, então ficam no bundle do
 * servidor — as páginas são todas pré-renderizadas em build time e nenhuma
 * tradução chega ao cliente além da do idioma renderizado.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? pt;
}

/** Substitui `{chave}` pelos valores informados. */
export function t(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}

export type { Dictionary };
export * from "./config";
