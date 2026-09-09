"use client";

import Image from "next/image";
import { ExternalLink, Globe2, Mail, PackageSearch } from "lucide-react";
import { motion } from "framer-motion";
import { SiFacebook, SiInstagram, SiTiktok, SiWhatsapp } from "react-icons/si";
import { companyLinkProfile, companyLinks } from "@/lib/companyLinks";
import { trackEvent, type LinksEvent } from "@/lib/analytics";

type LinkItem = {
  href: string;
  label: string;
  detail?: string;
  event: LinksEvent;
  external?: boolean;
  icon: React.ReactNode;
  variant: "primary" | "secondary" | "social";
};

const contactLinks: LinkItem[] = [
  {
    href: companyLinks.whatsapp,
    label: "Fale conosco pelo WhatsApp",
    detail: "Atendimento direto",
    event: "links_whatsapp_click",
    external: true,
    icon: <SiWhatsapp size={24} aria-hidden />,
    variant: "primary",
  },
  {
    href: companyLinks.email,
    label: companyLinkProfile.email,
    detail: "E-mail comercial",
    event: "links_email_click",
    icon: <Mail size={22} strokeWidth={1.8} />,
    variant: "secondary",
  },
  {
    href: companyLinks.website,
    label: "Acesse nosso site",
    detail: "Conheça a 3WS",
    event: "links_website_click",
    icon: <Globe2 size={22} strokeWidth={1.8} />,
    variant: "secondary",
  },
  {
    href: companyLinks.stock,
    label: "Veja nosso estoque",
    detail: "Moldes disponíveis",
    event: "links_stock_click",
    icon: <PackageSearch size={22} strokeWidth={1.8} />,
    variant: "secondary",
  },
];

const socialLinks: LinkItem[] = [
  {
    href: companyLinks.instagram,
    label: "Instagram",
    event: "links_instagram_click",
    external: true,
    icon: <SiInstagram size={22} aria-hidden />,
    variant: "social",
  },
  {
    href: companyLinks.facebook,
    label: "Facebook",
    event: "links_facebook_click",
    external: true,
    icon: <SiFacebook size={22} aria-hidden />,
    variant: "social",
  },
  {
    href: companyLinks.tiktok,
    label: "TikTok",
    event: "links_tiktok_click",
    external: true,
    icon: <SiTiktok size={22} aria-hidden />,
    variant: "social",
  },
];

function LinkCard({ item }: { item: LinkItem }) {
  const isPrimary = item.variant === "primary";
  const isSocial = item.variant === "social";

  return (
    <motion.a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      onClick={() => trackEvent(item.event, { target: item.href })}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={
        isPrimary
          ? "group flex min-h-16 items-center gap-4 rounded-2xl bg-teal px-5 py-4 text-white shadow-[0_18px_42px_rgba(44,141,255,0.34)] outline-none transition-colors hover:bg-teal-deep focus-visible:ring-2 focus-visible:ring-white/75"
          : isSocial
            ? "group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.11] px-2 py-3 text-center text-white shadow-[0_16px_36px_rgba(0,0,0,0.24)] outline-none backdrop-blur-xl transition-colors hover:border-teal/45 hover:bg-white/[0.15] focus-visible:ring-2 focus-visible:ring-teal"
          : "group flex min-h-14 items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.11] px-4 py-3 text-white shadow-[0_16px_36px_rgba(0,0,0,0.24)] outline-none backdrop-blur-xl transition-colors hover:border-teal/45 hover:bg-white/[0.15] focus-visible:ring-2 focus-visible:ring-teal"
      }
    >
      <span
        className={
          isPrimary
            ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-teal"
        }
      >
        {item.icon}
      </span>
      <span className={isSocial ? "min-w-0" : "min-w-0 flex-1"}>
        <span
          className={
            isSocial
              ? "block break-words font-body text-xs font-medium leading-tight sm:text-sm"
              : "block truncate font-body text-[15px] font-medium leading-tight"
          }
        >
          {item.label}
        </span>
        {item.detail ? (
          <span className={isPrimary ? "mt-1 block text-xs text-white/76" : "mt-1 block text-xs text-white/52"}>
            {item.detail}
          </span>
        ) : null}
      </span>
      {isSocial ? null : (
        <ExternalLink
          size={20}
          strokeWidth={1.7}
          className={isPrimary ? "shrink-0 text-white/72" : "shrink-0 text-white/40 group-hover:text-teal"}
        />
      )}
    </motion.a>
  );
}

export function LinksPageClient() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[image:url('/images/links-background-mobile.webp')] bg-cover bg-center opacity-72 md:bg-[image:url('/images/links-background-desktop.webp')]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/58 to-ink/88" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 py-8 sm:px-6 sm:py-10">
        <section className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <a href={companyLinks.website} aria-label="Acessar site da 3WS Moldes" className="inline-flex">
              <Image
                src={companyLinkProfile.logo}
                alt={companyLinkProfile.name}
                width={150}
                height={50}
                priority
                className="h-12 w-auto"
              />
            </a>
            <h1 className="sr-only">{companyLinkProfile.name}</h1>
            <p className="mt-6 max-w-sm font-body text-sm leading-relaxed text-white/68">
              {companyLinkProfile.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mt-9 flex flex-col gap-3"
          >
            <LinkCard item={contactLinks[0]} />
            <div className="grid grid-cols-1 gap-3">
              {contactLinks.slice(1).map((item) => (
                <LinkCard key={item.event} item={item} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="mt-8"
          >
            <p className="mb-3 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">
              Redes sociais
            </p>
            <div className="grid grid-cols-3 gap-3">
              {socialLinks.map((item) => (
                <div key={item.event}>
                  <LinkCard item={item} />
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
