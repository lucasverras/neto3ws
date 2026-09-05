"use client";

import Image from "next/image";
import { ArrowUpRight, Globe2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { companyLinkProfile, companyLinks } from "@/lib/companyLinks";
import { trackEvent, type LinksEvent } from "@/lib/analytics";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden focusable="false">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden focusable="false">
      <path d="M13.5 21v-7.7h2.6l.4-3h-3V8.4c0-.86.24-1.45 1.48-1.45h1.58V4.27A21.2 21.2 0 0 0 14.26 4c-2.28 0-3.84 1.39-3.84 3.95v2.2H7.84v3h2.58V21h3.08z" />
    </svg>
  );
}

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
    icon: <WhatsAppIcon />,
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
];

const socialLinks: LinkItem[] = [
  {
    href: companyLinks.instagram,
    label: "Instagram",
    event: "links_instagram_click",
    external: true,
    icon: <InstagramIcon />,
    variant: "social",
  },
  {
    href: companyLinks.facebook,
    label: "Facebook",
    event: "links_facebook_click",
    external: true,
    icon: <FacebookIcon />,
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
          ? "group flex min-h-16 items-center gap-4 rounded-2xl bg-teal px-5 py-4 text-white shadow-[0_18px_42px_rgba(44,141,255,0.28)] outline-none transition-colors hover:bg-teal-deep focus-visible:ring-2 focus-visible:ring-ink/50"
          : "group flex min-h-14 items-center gap-4 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-ink shadow-[0_12px_28px_rgba(10,11,26,0.06)] outline-none transition-colors hover:border-teal/30 hover:text-teal focus-visible:ring-2 focus-visible:ring-teal"
      }
    >
      <span
        className={
          isPrimary
            ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/[0.04] text-teal"
        }
      >
        {item.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={
            isSocial
              ? "block font-body text-sm font-medium leading-tight"
              : "block truncate font-body text-[15px] font-medium leading-tight"
          }
        >
          {item.label}
        </span>
        {item.detail ? (
          <span className={isPrimary ? "mt-1 block text-xs text-white/70" : "mt-1 block text-xs text-ink/45"}>
            {item.detail}
          </span>
        ) : null}
      </span>
      {isSocial ? null : (
        <ArrowUpRight
          size={20}
          strokeWidth={1.7}
          className={isPrimary ? "shrink-0 text-white/70" : "shrink-0 text-ink/35 group-hover:text-teal"}
        />
      )}
    </motion.a>
  );
}

export function LinksPageClient() {
  return (
    <main className="min-h-dvh overflow-hidden bg-alabaster text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 py-8 sm:px-6 sm:py-10">
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
            <h1 className="mt-7 font-display text-3xl font-medium tracking-normal text-ink">
              {companyLinkProfile.name}
            </h1>
            <p className="mt-3 max-w-sm font-body text-sm leading-relaxed text-ink/62">
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
            <p className="mb-3 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-ink/38">
              Redes sociais
            </p>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((item) => (
                <LinkCard key={item.event} item={item} />
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
