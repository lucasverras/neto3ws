import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

/**
 * O painel é um segmento raiz próprio, fora de `[locale]` — ele não tem
 * versão por idioma. Como `/links`, precisa do seu próprio <html>, da fonte e
 * do globals.css: sem isso a página sai sem estilo nenhum.
 *
 * É ferramenta de trabalho, não vitrine, então fica fora do Header, Footer,
 * cursor custom e seletor de idioma do site — herda só a identidade visual
 * (fundo ink, acento teal, Satoshi).
 */
const satoshi = localFont({
  src: [
    { path: "../../fonts/satoshi/Satoshi-Light.otf", weight: "300", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Painel | 3WS Moldes",
  // Nenhuma página do painel pode ser indexada, nem seguida.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full bg-ink text-white">{children}</body>
    </html>
  );
}
