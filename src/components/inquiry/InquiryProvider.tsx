"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { InquiryService } from "@/lib/inquiries/schema";
import { InquiryForm } from "./InquiryForm";

type InquiryContextValue = {
  openInquiry: (service?: InquiryService) => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside <InquiryProvider>");
  return ctx;
}

/** Provides `openInquiry()` and renders the quote request dialog once for the whole site. */
export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; service?: InquiryService; key: number }>({
    open: false,
    key: 0,
  });
  const returnFocus = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openInquiry = useCallback((service?: InquiryService) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    // A fresh key resets the form each time it opens.
    setState((prev) => ({ open: true, service, key: prev.key + 1 }));
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    returnFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      // Keep Tab focus inside the dialog.
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([tabindex="-1"]):not([type="hidden"]), select, textarea, [tabindex="0"]',
        );
        const visible = Array.from(focusable).filter((el) => el.offsetParent !== null);
        if (!visible.length) return;
        const first = visible[0];
        const last = visible[visible.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state.open, close]);

  const value = useMemo(() => ({ openInquiry }), [openInquiry]);

  return (
    <InquiryContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {state.open && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              className="absolute inset-0 bg-navy-950/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Request a free quote"
              tabIndex={-1}
              className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-xl)] bg-white shadow-[var(--shadow-xl)] outline-none sm:rounded-[var(--radius-xl)]"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Request a free quote</p>
                  <p className="text-xs text-ink-3">Takes about a minute</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-paper-cool hover:text-ink"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="overflow-y-auto px-6 py-6">
                <InquiryForm key={state.key} defaultService={state.service} onClose={close} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </InquiryContext.Provider>
  );
}
