"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { scrollToId } from "@/lib/scrollTo";
import { whatsappUrl } from "@/lib/site";
import { localePath, stripLocale } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/context";

/** `anchor` vira link para a home do idioma quando não estamos nela. */
const NAV = [
  { anchor: "servicos", key: "services" },
  { anchor: "categorias", key: "categories" },
  { anchor: null, path: "/estoque", key: "stock" },
  { anchor: "como-funciona", key: "howItWorks" },
  { anchor: "sobre", key: "about" },
  { anchor: "faq", key: "faq" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const isHome = stripLocale(pathname ?? "/") === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Na home a âncora rola suavemente; fora dela vira navegação normal para
  // /{idioma}#secao, que o navegador resolve ao carregar a página.
  const handleAnchor = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (!isHome) return;
    event.preventDefault();
    scrollToId(anchor);
  };

  const hrefFor = (item: (typeof NAV)[number]) =>
    item.anchor === null
      ? localePath(locale, item.path)
      : `${localePath(locale)}#${item.anchor}`;

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-out ${
        scrolled ? "px-4 pt-4 md:px-6 md:pt-6" : "px-0 pt-0"
      }`}
    >
      <div
        className={`pointer-events-auto mx-auto flex h-16 items-center justify-between border backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-out pl-5 pr-2 md:h-[4.25rem] md:pl-6 md:pr-2.5 ${
          scrolled
            ? "max-w-5xl rounded-2xl border-white/15 bg-ink/45 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            : "max-w-full rounded-none border-transparent border-b-white/10 bg-ink/80 shadow-none"
        }`}
      >
        <Link
          href={localePath(locale)}
          className="relative z-10 flex shrink-0 items-center"
          aria-label={dict.header.logoAria}
        >
          <Image
            src="/images/logo.webp"
            alt="3WS Moldes"
            width={150}
            height={50}
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={hrefFor(item)}
              onClick={(e) => item.anchor && handleAnchor(e, item.anchor)}
              className="font-body text-[14px] tracking-[0.01em] text-white/70 transition-colors hover:text-teal"
            >
              {dict.header.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.a
            href={whatsappUrl(dict.header.ctaMessage)}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.035 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden shrink-0 items-center rounded-full bg-teal px-5 py-2.5 font-body text-[13px] font-medium tracking-[0.01em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)] transition-colors duration-300 hover:bg-teal-deep hover:shadow-[0_6px_24px_rgba(44,141,255,0.5)] lg:inline-flex"
          >
            {dict.header.cta}
          </motion.a>

          <button
            type="button"
            aria-label={open ? dict.header.closeMenu : dict.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-ink/70 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
          >
            <div className="flex flex-col gap-6 px-7 py-8">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={hrefFor(item)}
                  onClick={(e) => {
                    setOpen(false);
                    if (item.anchor) handleAnchor(e, item.anchor);
                  }}
                  className="font-display text-2xl font-semibold tracking-tight text-white"
                >
                  {dict.header.nav[item.key]}
                </Link>
              ))}

              <a
                href={whatsappUrl(dict.header.ctaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex w-fit items-center rounded-full bg-teal px-6 py-3 font-body text-[14px] font-medium tracking-[0.01em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)]"
              >
                {dict.header.cta}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
