import type { Metadata } from "next";
import { LinksPageClient } from "./LinksPageClient";
import { companyLinkProfile } from "@/lib/companyLinks";
import { SITE, absoluteUrl } from "@/lib/site";

const title = `${companyLinkProfile.name} | Links e contato`;
const description = `Acesse os canais oficiais da ${companyLinkProfile.name}: WhatsApp, estoque, site, e-mail, Instagram, Facebook e TikTok.`;
const canonical = absoluteUrl("/links");

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  alternates: {
    canonical,
  },
  openGraph: {
    type: "website",
    title,
    description,
    url: canonical,
    siteName: SITE.name,
    locale: "pt_BR",
    images: [
      {
        url: SITE.logo,
        width: 300,
        height: 100,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [SITE.logo],
  },
};

export default function LinksPage() {
  return <LinksPageClient />;
}
