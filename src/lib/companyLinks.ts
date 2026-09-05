import { SITE, absoluteUrl, whatsappUrl } from "@/lib/site";

const whatsappMessage = "Olá! Vim pelo site e gostaria de falar com vocês.";

export const companyLinks = {
  whatsapp: whatsappUrl(whatsappMessage),
  email: `mailto:${SITE.email}`,
  website: absoluteUrl("/pt"),
  stock: absoluteUrl("/pt/estoque"),
  instagram: "https://www.instagram.com/3wsmoldes/",
  facebook: "https://www.facebook.com/people/3WS-Moldes-e-Equipamentos/61569574709367/",
  tiktok: "https://www.tiktok.com/@3wsmoldes",
} as const;

export const companyLinkProfile = {
  name: SITE.name,
  description:
    "Compra, venda e intermediação de moldes de injeção, porta-moldes e equipamentos industriais.",
  email: SITE.email,
  logo: SITE.logo,
} as const;
