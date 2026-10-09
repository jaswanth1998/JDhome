"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Car, Cctv, Warehouse, Wrench, type LucideIcon } from "lucide-react";
import { useInquiry } from "@/components/inquiry";
import type { InquiryService } from "@/lib/inquiries/schema";
import { cn } from "@/lib/utils";

const quickPicks: { label: string; hint: string; service: InquiryService; icon: LucideIcon }[] = [
  { label: "Garage door repair", hint: "Stuck, noisy, springs", service: "garage-repair", icon: Wrench },
  { label: "New garage door", hint: "Replace or install", service: "garage-install", icon: Warehouse },
  { label: "Security cameras", hint: "Install or upgrade", service: "security-cameras", icon: Cctv },
  { label: "Car lockout", hint: "Help 24/7", service: "car-lockout", icon: Car },
];

/** When the tile highlight starts (after the card and tiles have animated in). */
const SPOTLIGHT_START_MS = 1800;
/** Time each tile stays highlighted. */
const SPOTLIGHT_STEP_MS = 900;
/** How many full passes across the tiles before it rests. */
const SPOTLIGHT_ROUNDS = 2;

/**
 * "Start your free quote" card in the home hero. On first view it slides up, pops
 * its four tiles in one by one, then walks a gold highlight across them to invite a
 * pick. The highlight stops for good once the visitor hovers or taps the card.
 */
export function QuoteStarterCard({ className }: { className?: string }) {
  const { openInquiry } = useInquiry();
  const reduceMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState<number | null>(null);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    if (reduceMotion || engaged) return;
    let step = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setSpotlight(0);
      interval = setInterval(() => {
        step += 1;
        if (step >= quickPicks.length * SPOTLIGHT_ROUNDS) {
          clearInterval(interval);
          setSpotlight(null);
          return;
        }
        setSpotlight(step % quickPicks.length);
      }, SPOTLIGHT_STEP_MS);
    }, SPOTLIGHT_START_MS);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [reduceMotion, engaged]);

  const stopSpotlight = () => {
    setEngaged(true);
    setSpotlight(null);
  };

  return (
    // Entrance animations are CSS (.anim-rise / .anim-pop in globals.css) so the card
    // appears even before JavaScript loads; framer-motion only drives the highlight.
    <div
      onPointerEnter={stopSpotlight}
      onFocusCapture={stopSpotlight}
      className={cn(
        "anim-rise relative rounded-[var(--radius-xl)] border border-line bg-white p-5 shadow-[var(--shadow-xl)] md:p-6",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
        <span className="live-dot" aria-hidden="true" />
        Start your free quote
      </p>
      <p className="mt-2 font-[family-name:var(--font-heading)] text-lg font-bold text-ink">
        What can we help you with?
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {quickPicks.map(({ label, hint, service, icon: Icon }, i) => {
          const lit = spotlight === i;
          return (
            <motion.button
              key={service}
              type="button"
              onClick={() => openInquiry(service)}
              initial={false}
              animate={{ scale: lit ? 1.03 : 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 300 }}
              style={{ animationDelay: `${0.55 + i * 0.12}s` }}
              className={cn(
                "anim-pop group flex flex-col items-start gap-1 rounded-[var(--radius-lg)] border px-3.5 py-3 text-left transition-colors duration-300",
                "hover:border-gold-500 hover:bg-gold-100/60",
                lit
                  ? "border-gold-500 bg-gold-100 shadow-[0_0_0_4px_rgba(217,169,58,0.18)]"
                  : "border-line-strong bg-white",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <Icon className={cn("h-5 w-5 transition-colors", lit ? "text-gold-700" : "text-navy-700")} aria-hidden="true" />
                <ArrowRight
                  className={cn(
                    "h-4 w-4 transition-all group-hover:translate-x-0.5 group-hover:text-gold-700",
                    lit ? "translate-x-0.5 text-gold-700" : "text-ink-3",
                  )}
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1 block text-sm font-semibold text-ink">{label}</span>
              <span className="block text-xs text-ink-3">{hint}</span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-ink-3">No obligation · Quick to fill in</p>
    </div>
  );
}

export default QuoteStarterCard;
