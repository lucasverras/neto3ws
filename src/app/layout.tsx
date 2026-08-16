import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { SITE } from "@/lib/site";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const satoshi = localFont({
  src: [
    { path: "../fonts/satoshi/Satoshi-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/satoshi/Satoshi-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../fonts/satoshi/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/satoshi/Satoshi-Italic.otf", weight: "400", style: "italic" },
    { path: "../fonts/satoshi/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/satoshi/Satoshi-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../fonts/satoshi/Satoshi-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/satoshi/Satoshi-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../fonts/satoshi/Satoshi-Black.otf", weight: "900", style: "normal" },
    { path: "../fonts/satoshi/Satoshi-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase resolve canonical e Open Graph relativos das páginas filhas.
  metadataBase: new URL(SITE.url),
  title: "3WS | Ativos Industriais de Alto Valor",
  description:
    "Compra, venda e intermediação de moldes para injeção plástica, porta-moldes, bases para estampos e equipamentos industriais em todo o Brasil.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "pt_BR",
    url: SITE.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${satoshi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-white">
        <CustomCursor />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
