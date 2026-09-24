"use client";

import { Phone } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";

/** Sticky call + quote bar shown on phones. */
export function MobileCallButton() {
  return (
    <div className="sticky-mobile-cta md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-primary w-full">
          <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
          Call now
        </a>
        <InquiryButton fullWidth icon={null}>
          Free quote
        </InquiryButton>
      </div>
    </div>
  );
}

export default MobileCallButton;
