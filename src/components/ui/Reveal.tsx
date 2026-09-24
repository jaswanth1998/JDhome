"use client";

import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  /** Render as a list item when used directly inside <ul>/<ol>. */
  as?: "div" | "li";
  className?: string;
}

/** Fades content up once it scrolls into view. */
export function Reveal({ children, delay = 0, as = "div", className }: RevealProps) {
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </Component>
  );
}

export default Reveal;
