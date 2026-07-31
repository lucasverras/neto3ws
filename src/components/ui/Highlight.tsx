"use client";

import { motion } from "framer-motion";

export function Highlight({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
        style={{ transformOrigin: "left" }}
        className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.32em] rounded-[2px] bg-teal/45 sm:bottom-[0.1em]"
      />
    </span>
  );
}
