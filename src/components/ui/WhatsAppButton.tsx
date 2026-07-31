"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHONE = "5511973692861";

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

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
            Entre em contato pelo WhatsApp
          </motion.span>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${PHONE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-teal text-2xl shadow-[0_8px_28px_rgba(44,141,255,0.5)]"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-teal/60"
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 2 }}
        />
        <motion.span
          className="relative"
          animate={{ rotate: [0, -12, 10, -8, 6, 0], scale: [1, 1.08, 1.08, 1.08, 1.04, 1] }}
          transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
        >
          🦾
        </motion.span>
      </motion.a>
    </div>
  );
}
