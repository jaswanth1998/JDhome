"use client";

import { Phone } from "lucide-react";
import { theme } from "@/config/theme";

export function MobileCallButton() {
  return (
    <div className="sticky-mobile-cta md:hidden">
      <a
        href={`tel:${theme.contact.phone.tel}`}
        className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--accent-orange)] text-white font-semibold rounded-lg shadow-lg hover:bg-[var(--accent-orange-hover)] transition-colors"
      >
        <Phone className="w-5 h-5" />
        <span>Call Now: {theme.contact.phone.display}</span>
      </a>
    </div>
  );
}

export default MobileCallButton;
