"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useInquiry } from "./InquiryProvider";

/** How far the visitor scrolls (px) before the button appears. */
const SHOW_AFTER = 640;

/**
 * Desktop/tablet floating "Get a free quote" button. Slides in once the visitor has
 * scrolled past the hero, so the quote is always one click away. Phones use the
 * sticky call/quote bar instead, and the contact page already shows the form.
 */
export function FloatingQuoteButton() {
  const { openInquiry } = useInquiry();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 420;
      setVisible(window.scrollY > SHOW_AFTER && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/contact")) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => openInquiry()}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="cta-shine fixed bottom-6 right-6 z-40 hidden items-center gap-3 rounded-full bg-gold-500 py-3 pl-3 pr-5 text-left text-navy-900 shadow-[0_18px_40px_-12px_rgba(8,27,51,0.45)] transition-colors hover:bg-gold-600 md:flex"
          aria-label="Get a free quote"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-gold-500">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-[0.9375rem] font-bold">Get a free quote</span>
            <span className="block text-xs font-medium text-navy-900/70">Takes about a minute</span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default FloatingQuoteButton;
