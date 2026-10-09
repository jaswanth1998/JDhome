"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Pages that hide the "24/7 car lockout line" in the header and footer.
 * Garage door ads land here, and visitors read the line as 24/7 garage help.
 */
const HIDDEN_ON = ["/lp/garage-door-repair"];

export function useShowLockoutLine(): boolean {
  const pathname = usePathname() ?? "";
  return !HIDDEN_ON.some((path) => pathname.startsWith(path));
}

/** Renders its children only where the 24/7 lockout line should show (usable from server components). */
export function LockoutLine({ children }: { children: ReactNode }) {
  return useShowLockoutLine() ? <>{children}</> : null;
}
