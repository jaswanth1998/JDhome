"use client";

import { theme } from "@/config/theme";
import { TrustBadge, SectionHeading } from "@/components/ui";

export function WhyChooseUs() {
  return (
    <section className="section bg-[var(--bg-secondary)]" id="why-choose-us">
      <div className="container">
        <SectionHeading
          title="Why People Trust JD Home Services"
          subtitle="We focus on the three services customers call for most: locksmith work, rapid car lockout help, and dependable garage door repair and installation."
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
