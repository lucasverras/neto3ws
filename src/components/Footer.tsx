"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";
import { localePath, stripLocale } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/context";
import { scrollToId } from "@/lib/scrollTo";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
      <circle cx="7.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.5 16.5v-4a2.2 2.2 0 0 1 4.4 0v4" />
      <line x1="11.5" y1="10.5" x2="11.5" y2="16.5" />
    </svg>
  );
}

const QUICK_LINKS = [
  { anchor: "servicos", key: "services" },
  { anchor: "categorias", key: "categories" },
  { anchor: null, path: "/estoque", key: "stock" },
  { anchor: "como-funciona", key: "howItWorks" },
  { anchor: "sobre", key: "about" },
  { anchor: "faq", key: "faq" },
] as const;

const SERVICE_KEYS = ["buy", "sell", "broker", "weight", "consulting"] as const;

export function Footer() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const isHome = stripLocale(pathname ?? "/") === "/";

  const hrefFor = (item: (typeof QUICK_LINKS)[number]) =>
    item.anchor === null
      ? localePath(locale, item.path)
      : `${localePath(locale)}#${item.anchor}`;

  // Na home a âncora rola suavemente; fora dela precisa navegar de verdade.
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (!isHome) return;
    e.preventDefault();
    scrollToId(anchor);
  };

  return (
    <footer className="bg-ink text-white">
      <Container>
        <Reveal className="grid grid-cols-1 gap-14 py-20 md:grid-cols-12 md:gap-8 md:py-24">
          <div className="flex flex-col gap-6 md:col-span-4">
            <Image
              src="/images/logo.webp"
              alt="3WS Moldes"
              width={150}
              height={50}
              className="h-9 w-auto self-start"
            />
            <p className="max-w-xs font-body text-sm leading-relaxed text-white/50">
              {dict.footer.description}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <motion.a
                href="#"
                aria-label={dict.footer.instagram}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-teal hover:text-white hover:ring-teal"
              >
                <InstagramIcon />
              </motion.a>
              <motion.a
                href="#"
                aria-label={dict.footer.linkedin}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-teal hover:text-white hover:ring-teal"
              >
                <LinkedinIcon />
              </motion.a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-4 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <span className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
                {dict.footer.quickLinks}
              </span>
              <ul className="flex flex-col gap-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={hrefFor(link)}
                      onClick={(e) => link.anchor && handleAnchor(e, link.anchor)}
                      className="font-body text-sm text-white/65 transition-colors hover:text-teal"
                    >
                      {dict.header.nav[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
                {dict.footer.services}
              </span>
              <ul className="flex flex-col gap-3">
                {SERVICE_KEYS.map((key) => (
                  <li key={key}>
                    <Link
                      href={`${localePath(locale)}#servicos`}
                      onClick={(e) => handleAnchor(e, "servicos")}
                      className="font-body text-sm text-white/65 transition-colors hover:text-teal"
                    >
                      {dict.footer.serviceList[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:col-span-4 md:grid md:grid-cols-2 md:gap-8">
            <div className="flex flex-col gap-4">
              <span className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
                {dict.footer.contact}
              </span>
              <ul className="flex flex-col gap-3 font-body text-sm text-white/65">
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:text-teal">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${SITE.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal"
                  >
                    {SITE.phoneLabel}
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
                {dict.footer.address}
              </span>
              <p className="font-body text-sm leading-relaxed text-white/65">
                {SITE.address.street}
                <br />
                {SITE.address.locality}/{SITE.address.region} — CEP {SITE.address.postalCode}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col-reverse items-start gap-4 py-6 font-body text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} {SITE.legalName}. {dict.footer.rights}{" "}
            {dict.footer.developedBy}{" "}
            <a
              href="https://www.ergonagencia.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/70"
            >
              Ergon Digital Product Studio
            </a>
            .
          </span>
          <a href="#" className="transition-colors hover:text-white/70">
            {dict.footer.privacy}
          </a>
        </Container>
      </div>
    </footer>
  );
}
