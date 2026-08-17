"use client";

import { createContext, useContext } from "react";
import { pt, type Dictionary } from "./dictionaries/pt";
import { DEFAULT_LOCALE, type Locale } from "./config";

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, dict: pt });

/**
 * Entrega idioma e dicionário às seções, que são todas client components.
 * O valor vem do layout do segmento [locale], já resolvido no servidor, então
 * só o dicionário do idioma renderizado chega ao cliente.
 */
export function I18nProvider({
  locale,
  dict,
  children,
}: I18nValue & { children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
