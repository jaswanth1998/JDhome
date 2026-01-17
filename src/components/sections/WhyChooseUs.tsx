"use client";

import { theme } from "@/config/theme";
import { TrustBadge, SectionHeading } from "@/components/ui";

export function WhyChooseUs() {
  return (
    <section className="section bg-[var(--bg-secondary)]" id="why-choose-us">
      <div className="container">
        <SectionHeading
          title="Why Oshawa and Durham Trust JD Home Services"
          subtitle="We combine traditional locksmith expertise with modern smart home technology to deliver exceptional service."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {theme.trustIndicators.badges.map((badge) => (
            <TrustBadge
              key={badge.id}
              text={badge.text}
              description={badge.description}
              icon={badge.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
