/** Dados reais da 3WS usados em metadata, JSON-LD e CTAs. Nada aqui é fictício. */

export const SITE = {
  name: "3WS Moldes",
  legalName: "3WS Moldes e Equipamentos",
  /**
   * Ajuste via NEXT_PUBLIC_SITE_URL no deploy. O padrão segue o domínio do
   * e-mail comercial já publicado no rodapé do site.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.3wsmoldes.com.br").replace(/\/$/, ""),
  email: "comercial@3wsmoldes.com.br",
  whatsapp: "5511973692861",
  phoneLabel: "(11) 97369-2861",
  logo: "/images/logo.webp",
  address: {
    street: "Rua Dr. Edgard Magalhães Noronha, 789 — Vila Nova York",
    locality: "São Paulo",
    region: "SP",
    postalCode: "03480-000",
    country: "BR",
  },
} as const;

/** Link de WhatsApp com mensagem pronta, usando o número já configurado no site. */
export function whatsappUrl(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function absoluteUrl(pathname: string) {
  return `${SITE.url}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
