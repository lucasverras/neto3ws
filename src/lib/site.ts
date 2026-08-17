/** Dados reais da 3WS usados em metadata, JSON-LD e CTAs. Nada aqui é fictício. */

export const SITE = {
  name: "3WS Moldes",
  legalName: "3WS Moldes e Equipamentos",
  /**
   * Origem usada em canonical, hreflang, Open Graph e sitemap.
   *
   * O padrão é o endereço que hoje realmente serve o site. Quando o domínio
   * próprio for ligado no Vercel, basta atualizar NEXT_PUBLIC_SITE_URL — usar
   * um domínio que ainda não responde faria o canonical apontar para o vazio.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://neto3ws.vercel.app").replace(/\/$/, ""),
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
