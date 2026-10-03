"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InquiryButton } from "@/components/inquiry";

/** When the speech bubble appears, and how long it stays. */
const BUBBLE_SHOW_MS = 1400;
const BUBBLE_HIDE_MS = 7500;

/**
 * Main hero call to action: the gold quote button gives a small "nudge" every few
 * seconds (CSS `.cta-nudge`), and a speech bubble briefly points at it after the
 * page opens. Both stay still for visitors who prefer reduced motion.
 */
export function HeroQuoteButton() {
  const reduceMotion = useReducedMotion();
  const [bubble, setBubble] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const show = setTimeout(() => setBubble(true), BUBBLE_SHOW_MS);
    const hide = setTimeout(() => setBubble(false), BUBBLE_HIDE_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [reduceMotion]);

  return (
    <div className="relative" onPointerEnter={() => setBubble(false)}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", damping: 16, stiffness: 320 }}
            className="pointer-events-none absolute bottom-full left-4 mb-3 whitespace-nowrap rounded-full bg-navy-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-[var(--shadow-lg)]"
            role="status"
          >
            <span aria-hidden="true">👋 </span>Free quote in about a minute
            <span
              className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 rounded-[2px] bg-navy-900"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <InquiryButton size="lg" className="cta-nudge w-full sm:w-auto">
        Get my free quote
      </InquiryButton>
    </div>
  );
}

export default HeroQuoteButton;
