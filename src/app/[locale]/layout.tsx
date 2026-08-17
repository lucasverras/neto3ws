import type { Metadata } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import "../globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { LanguageFab } from "@/components/ui/LanguageFab";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { SITE, absoluteUrl } from "@/lib/site";
import {
  LOCALES,
  LOCALE_TAGS,
  OG_LOCALES,
  getDictionary,
  isLocale,
  localePath,
} from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";
import { languageAlternates } from "@/lib/stock/generateMetadata";

const satoshi = localFont({
  src: [
    { path: "../../fonts/satoshi/Satoshi-Light.otf", weight: "300", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../../fonts/satoshi/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-Italic.otf", weight: "400", style: "italic" },
    { path: "../../fonts/satoshi/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../../fonts/satoshi/Satoshi-Bold.otf", weight: "700", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../../fonts/satoshi/Satoshi-Black.otf", weight: "900", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

/** Os três idiomas são pré-renderizados; nada é gerado sob demanda. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(SITE.url),
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    alternates: {
      canonical: localePath(locale),
      languages: languageAlternates((l) => localePath(l)),
    },
    openGraph: {
      type: "website",
      title: dict.meta.home.title,
      description: dict.meta.home.description,
      url: absoluteUrl(localePath(locale)),
      siteName: SITE.name,
      locale: OG_LOCALES[locale],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={LOCALE_TAGS[locale]} className={`${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink text-white">
        <I18nProvider locale={locale} dict={dict}>
          <CustomCursor />
          {children}
          <LanguageFab />
          <WhatsAppButton />
        </I18nProvider>
      </body>
    </html>
  );
}
