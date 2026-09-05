"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { useI18n } from "@/lib/i18n/context";
import { SITE } from "@/lib/site";

/** Verde oficial do WhatsApp — fora da paleta do site de propósito: o botão
 *  precisa ser reconhecido como WhatsApp antes de ser reconhecido como 3WS. */
const WHATSAPP_GREEN = "#25D366";

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const { dict } = useI18n();

  return (
    <div className="fixed bottom-5 right-5 z-50 md:bottom-8 md:right-8">
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-1/2 right-full mr-3 translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-ink px-4 py-2 font-body text-xs text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            {dict.whatsapp.tooltip}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${SITE.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={dict.whatsapp.aria}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{ backgroundColor: WHATSAPP_GREEN }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] outline-none ring-white/70 focus-visible:ring-2"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: WHATSAPP_GREEN, opacity: 0.6 }}
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 2 }}
        />
        <span className="relative flex items-center justify-center">
          <SiWhatsapp size={30} aria-hidden />
        </span>
      </motion.a>
    </div>
  );
}
