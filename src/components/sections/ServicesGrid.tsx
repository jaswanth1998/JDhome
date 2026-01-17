"use client";

import { theme } from "@/config/theme";
import { ServiceCard, SectionHeading } from "@/components/ui";

// Type for service with optional badge
type ServiceWithBadge = {
  id: string;
  name: string;
  shortDescription: string;
  icon: string;
  color: string;
  badge?: string;
  featured: boolean;
};

export function ServicesGrid() {
  return (
    <section className="section bg-white" id="services">
      <div className="container">
        <SectionHeading
          title="Professional Locksmith Services in Oshawa and Durham"
          subtitle="From smart lock installations to emergency lockouts, we provide comprehensive security solutions for your home and business."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(theme.services.categories as unknown as ServiceWithBadge[]).map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              shortDescription={service.shortDescription}
              icon={service.icon}
              color={service.color}
              badge={service.badge}
              featured={service.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesGrid;
