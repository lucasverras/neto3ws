"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

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
  { href: "#servicos", label: "Serviços" },
  { href: "#categorias", label: "Categorias" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#sobre", label: "Sobre" },
  { href: "#faq", label: "FAQ" },
];

const SERVICES = [
  "Compra de moldes e equipamentos",
  "Venda de moldes e equipamentos",
  "Intermediação comercial",
  "Compra de ferramentas por peso",
  "Avaliação e consultoria técnica",
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <Container>
      <Reveal className="grid grid-cols-1 gap-14 py-20 md:grid-cols-12 md:gap-8 md:py-24">
        <div className="flex flex-col gap-6 md:col-span-4">
          <Image
            src="/images/logo.webp"
            alt="3WS Moldes"
            width={140}
            height={46}
            className="h-9 w-auto"
          />
          <p className="max-w-xs font-body text-sm leading-relaxed text-white/50">
            Compra, venda e intermediação de moldes e equipamentos
            industriais. Três gerações transformando ativos parados em
            oportunidade, em todo o Brasil.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <motion.a
              href="#"
              aria-label="Instagram da 3WS"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-teal hover:text-white hover:ring-teal"
            >
              <InstagramIcon />
            </motion.a>
            <motion.a
              href="#"
              aria-label="LinkedIn da 3WS"
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
              Links rápidos
            </span>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-white/65 transition-colors hover:text-teal"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
              Serviços
            </span>
            <ul className="flex flex-col gap-3">
              {SERVICES.map((service) => (
                <li key={service}>
                  <a
                    href="#servicos"
                    className="font-body text-sm text-white/65 transition-colors hover:text-teal"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:col-span-4 md:grid md:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-4">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
              Contato
            </span>
            <ul className="flex flex-col gap-3 font-body text-sm text-white/65">
              <li>
                <a href="mailto:contato@3ws.com.br" className="hover:text-teal">
                  contato@3ws.com.br
                </a>
              </li>
              <li>
                <a href="tel:+550000000000" className="hover:text-teal">
                  (00) 0000-0000
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-body text-xs uppercase tracking-[0.18em] text-white/40">
              Endereço
            </span>
            <p className="font-body text-sm leading-relaxed text-white/65">
              A definir — endereço da unidade 3WS.
            </p>
          </div>
        </div>
      </Reveal>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col-reverse items-start gap-4 py-6 font-body text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <span>3WS Moldes — Dados institucionais a definir.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-white/70">
              Política de Privacidade
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
