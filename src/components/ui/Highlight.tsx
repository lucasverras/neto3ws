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
    <motion.span
      initial={{ backgroundSize: "0% 0.32em" }}
      whileInView={{ backgroundSize: "100% 0.32em" }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        backgroundImage: "linear-gradient(rgba(44,141,255,0.45), rgba(44,141,255,0.45))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
      }}
    >
      {children}
    </motion.span>
  );
}
