"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  LOCALE_NAMES,
  localePath,
  stripLocale,
  type Locale,
} from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/context";

/** Lembra a escolha para o proxy mandar a próxima visita ao idioma certo. */
function rememberLocale(code: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=31536000;samesite=lax`;
}

/** Marca de que o aviso inicial já apareceu — por sessão, não por página. */
const HINT_SEEN = "3ws_lang_hint";
/** Espera o globo terminar de entrar (delay 1.2s) antes de apontar para ele. */
const HINT_DELAY = 1900;
const HINT_DURATION = 6000;

/**
 * Globo flutuante no canto inferior esquerdo, espelhando o botão de WhatsApp
 * à direita. Em repouso é só o globo; ao passar o mouse (ou tocar, no celular)
 * revela os outros idiomas empilhados acima.
 *
 * Cada idioma continua sendo um <Link> real para a mesma página no outro
 * idioma — é o que o rastreador segue. O clique também grava um cookie, que o
 * proxy usa para mandar a próxima visita direto para o idioma escolhido.
 */
export function LanguageFab() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  /** Marca que a aproximação do mouse já abriu — o clique seguinte não fecha. */
  const openedByPointer = useRef(false);

  const basePath = stripLocale(pathname ?? "/");
  const others = LOCALES.filter((code) => code !== locale);

  // Aviso de entrada: aparece uma vez por sessão, some sozinho e sai na hora
  // em que o usuário toca no globo. Guardar em sessionStorage evita repetir a
  // cada navegação interna sem prendê-lo para sempre.
  useEffect(() => {
    if (sessionStorage.getItem(HINT_SEEN)) return;
    const show = setTimeout(() => {
      setHint(true);
      sessionStorage.setItem(HINT_SEEN, "1");
    }, HINT_DELAY);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!hint) return;
    const hide = setTimeout(() => setHint(false), HINT_DURATION);
    return () => clearTimeout(hide);
  }, [hint]);

  // No toque não existe "sair com o mouse": fechar precisa vir de um toque fora.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Abrir o menu já cumpre o papel do aviso, então ele sai na mesma ação —
  // em vez de um efeito reagindo a `open`, que geraria render em cascata.
  const reveal = () => {
    openedByPointer.current = true;
    setOpen(true);
    setHint(false);
  };

  /**
   * Alternar no clique parece simples, mas em híbridos (e em emulação) a
   * aproximação dispara `pointerenter` logo antes do clique: um abriria e o
   * outro fecharia na mesma ação, e o menu nunca apareceria. Se a abertura
   * acabou de vir do ponteiro, o clique apenas confirma.
   */
  const toggle = () => {
    setHint(false);
    if (openedByPointer.current) {
      openedByPointer.current = false;
      setOpen(true);
      return;
    }
    setOpen((value) => !value);
  };

  const goTo = (code: Locale) => {
    openedByPointer.current = false;
    rememberLocale(code);
    router.push(`${localePath(code, basePath)}${window.location.search}`);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      // Só ponteiro de mouse abre por aproximação. No toque, o navegador dispara
      // um mouseenter sintético logo antes do clique: os dois se cancelariam e
      // o menu nunca abriria no celular.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") reveal();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        openedByPointer.current = false;
        setOpen(false);
      }}
      onFocus={reveal}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
      className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-2 md:bottom-8 md:left-8"
    >
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-2"
            aria-label={dict.common.changeLanguage}
          >
            {others.map((code, index) => (
              <motion.li
                key={code}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{
                  duration: 0.22,
                  delay: (others.length - 1 - index) * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={localePath(code, basePath)}
                  hrefLang={code}
                  aria-label={LOCALE_NAMES[code]}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(code);
                  }}
                  className="flex h-11 items-center rounded-full border border-white/15 bg-ink/90 px-4 font-body text-[12px] tracking-[0.14em] text-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.35)] outline-none ring-teal backdrop-blur-md transition-colors hover:border-teal hover:text-white focus-visible:ring-2"
                >
                  {LOCALE_LABELS[code]}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        <AnimatePresence>
          {hint && !open && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden
              className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-full border border-teal/40 bg-ink/95 px-3 py-1.5 font-body text-[11px] tracking-[0.04em] text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md"
            >
              {dict.common.languageHint}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
        type="button"
        aria-expanded={open}
        aria-label={`${dict.common.languageLabel}: ${LOCALE_NAMES[locale]}. ${dict.common.changeLanguage}`}
        onClick={toggle}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-ink/90 text-white shadow-[0_8px_28px_rgba(0,0,0,0.45)] outline-none ring-teal backdrop-blur-md transition-colors hover:border-teal hover:text-teal focus-visible:ring-2"
      >
          <Globe size={22} strokeWidth={1.5} aria-hidden />
          <span className="sr-only">{LOCALE_LABELS[locale]}</span>
        </motion.button>
      </div>
    </div>
  );
}
