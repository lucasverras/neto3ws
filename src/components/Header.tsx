"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#servicos", label: "serviços" },
  { href: "#categorias", label: "categorias" },
  { href: "#como-funciona", label: "como funciona" },
  { href: "#sobre", label: "sobre" },
  { href: "#faq", label: "faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 md:top-6 md:px-6">
      <div
        className={`mx-auto flex h-16 max-w-4xl items-center justify-between rounded-2xl border border-white/15 bg-ink/45 pl-5 pr-2 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300 md:h-[4.25rem] md:pl-6 md:pr-2.5 ${
          scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,0.35)]" : ""
        }`}
      >
        <a href="#top" className="relative z-10 flex shrink-0 items-center" aria-label="3WS — início">
          <Image
            src="/images/logo.webp"
            alt="3WS Moldes"
            width={148}
            height={48}
            priority
            className="h-8 w-auto md:h-9"
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-[14px] tracking-[0.01em] text-white/70 transition-colors hover:text-teal"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.a
            href="#contato"
            whileHover={{ scale: 1.035 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden shrink-0 items-center rounded-full bg-teal px-6 py-2.5 font-body text-[14px] font-medium tracking-[0.01em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)] transition-colors duration-300 hover:bg-teal-deep hover:shadow-[0_6px_24px_rgba(44,141,255,0.5)] lg:inline-flex"
          >
            solicitar avaliação
          </motion.a>

          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
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
            className="mx-auto mt-2 max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-ink/70 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
          >
            <div className="flex flex-col gap-6 px-7 py-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl font-semibold tracking-tight text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contato"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex w-fit items-center rounded-full bg-teal px-6 py-3 font-body text-[14px] font-medium tracking-[0.01em] text-white shadow-[0_4px_20px_rgba(44,141,255,0.35)]"
              >
                solicitar avaliação
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
