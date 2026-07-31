"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export function CountUp({
  target,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        setDisplay(Math.round(value).toLocaleString("pt-BR"));
      },
    });
    return () => controls.stop();
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
