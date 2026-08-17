"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { SITE } from "@/lib/site";

/** Verde oficial do WhatsApp — fora da paleta do site de propósito: o botão
 *  precisa ser reconhecido como WhatsApp antes de ser reconhecido como 3WS. */
const WHATSAPP_GREEN = "#25D366";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden focusable="false">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}

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
          <WhatsAppIcon />
        </span>
      </motion.a>
    </div>
  );
}
