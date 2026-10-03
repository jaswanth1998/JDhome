"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Phone, Pointer } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";

/**
 * When the speech bubble shows (ms after load). On the home page it waits until the
 * hero's own bubble has gone so only one talks at a time.
 */
const BUBBLE_DELAY_HOME_MS = 8500;
const BUBBLE_DELAY_MS = 2500;
const BUBBLE_VISIBLE_MS = 6000;
/** The bubble comes back once more after this gap, then stays away. */
const BUBBLE_REPEAT_MS = 30000;

/**
 * Sticky call + quote bar shown on phones. The quote button draws the eye with a
 * looping "tap" (CSS `.tap-hint` in globals.css: a hand taps it, the button presses,
 * a ripple splashes out) and a speech bubble that appears twice. Everything is off on
 * /contact/ (the form is already on screen) and for reduced motion.
 */
export function MobileCallButton() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const onContact = pathname?.startsWith("/contact");
  const animate = !reduceMotion && !onContact;
  const [bubble, setBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!animate || dismissed) return;
    const first = pathname === "/" ? BUBBLE_DELAY_HOME_MS : BUBBLE_DELAY_MS;
    const timers = [first, first + BUBBLE_REPEAT_MS].flatMap((at) => [
      setTimeout(() => setBubble(true), at),
      setTimeout(() => setBubble(false), at + BUBBLE_VISIBLE_MS),
    ]);
    return () => {
      timers.forEach(clearTimeout);
      setBubble(false);
    };
  }, [animate, dismissed, pathname]);

  return (
    <div className="sticky-mobile-cta md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-primary w-full">
          <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
          Call now
        </a>

        <div
          className={animate && !dismissed ? "tap-hint relative" : "relative"}
          onPointerDown={() => setDismissed(true)}
        >
          <AnimatePresence>
            {bubble && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ type: "spring", damping: 16, stiffness: 320 }}
                className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-full bg-navy-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-[var(--shadow-lg)]"
                role="status"
              >
                <span aria-hidden="true">👋 </span>Free quote in about a minute
                <span
                  className="absolute -bottom-1.5 right-10 h-3 w-3 rotate-45 rounded-[2px] bg-navy-900"
                  aria-hidden="true"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <InquiryButton fullWidth icon={null} className="tap-hint-button">
            Free quote
            <span className="tap-hint-ripple" aria-hidden="true" />
          </InquiryButton>
          <Pointer className="tap-hint-hand" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default MobileCallButton;
