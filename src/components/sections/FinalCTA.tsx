import { Phone } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";
import type { InquiryService } from "@/lib/inquiries/schema";

interface FinalCTAProps {
  title?: string;
  subtitle?: string;
  service?: InquiryService;
}

export function FinalCTA({
  title = "Ready when you are",
  subtitle = "Tell us about your garage door or camera project and we'll get back to you with clear options and a free quote.",
  service,
}: FinalCTAProps) {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-grid-dark px-6 py-12 md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-balance text-3xl text-white md:text-4xl">{title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">{subtitle}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <InquiryButton service={service} size="lg">
                Get a free quote
              </InquiryButton>
              <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-ghost-light btn-lg">
                <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                {theme.contact.phone.display}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
