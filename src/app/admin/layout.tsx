import type { Metadata } from "next";

/**
 * O painel é ferramenta de trabalho, não vitrine: fica fora do Header,
 * Footer, cursor custom e seletor de idioma do site. Herda apenas a
 * identidade visual da 3WS (fundo ink, acento teal, tipografia Satoshi),
 * que vem do layout raiz.
 */
export const metadata: Metadata = {
  title: "Painel | 3WS Moldes",
  // Nenhuma página do painel pode ser indexada, nem seguida.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-ink text-white">{children}</div>;
}
