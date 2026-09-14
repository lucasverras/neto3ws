import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, getDictionary, isLocale } from "@/lib/i18n";
import { institutionalMetadata } from "@/lib/stock/generateMetadata";
import { LandingPage } from "@/components/landing/LandingPage";
import { LANDING_SLUGS, getLandingContent, isLandingSlug } from "@/lib/landing/content";

/** Landings comerciais e de categoria × 3 idiomas, pré-renderizadas no build. */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    LANDING_SLUGS.map((landing) => ({ locale, landing }))
  );
}

// Conjunto fechado de slugs: qualquer outro caminho neste nível é 404.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; landing: string }>;
}): Promise<Metadata> {
  const { locale, landing } = await params;
  if (!isLocale(locale) || !isLandingSlug(landing)) return {};
  const content = getLandingContent(locale, landing);
  return institutionalMetadata(
    locale,
    `/${landing}`,
    content.metaTitle,
    content.metaDescription
  );
}

export default async function Landing({
  params,
}: {
  params: Promise<{ locale: string; landing: string }>;
}) {
  const { locale, landing } = await params;
  if (!isLocale(locale) || !isLandingSlug(landing)) notFound();
  // Garante que dicionário/idioma existem antes de montar a página.
  getDictionary(locale);
  return <LandingPage locale={locale} slug={landing} />;
}
