"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [pointer, setPointer] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { damping: 32, stiffness: 500, mass: 0.3 });
  const dotY = useSpring(y, { damping: 32, stiffness: 500, mass: 0.3 });
  const ringX = useSpring(x, { damping: 22, stiffness: 180, mass: 0.6 });
  const ringY = useSpring(y, { damping: 22, stiffness: 180, mass: 0.6 });

  useEffect(() => {
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFine) return;

    document.documentElement.classList.add("custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = e.target as HTMLElement;
      setPointer(!!el.closest("a, button, [role='button'], input, textarea, select"));
    };
    const hide = () => setVisible(false);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", hide);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
    };
  }, [x, y]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-teal"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible ? 1 : 0, scale: pointer ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-teal/60"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: pointer ? 46 : 26,
          height: pointer ? 46 : 26,
          opacity: visible ? (pointer ? 0.9 : 0.45) : 0,
          backgroundColor: pointer ? "rgba(44,141,255,0.12)" : "rgba(44,141,255,0)",
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />
    </>
  );
}
