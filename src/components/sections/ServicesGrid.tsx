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
          title="Locksmith, Car Lockout, and Garage Door Service in Oshawa"
          subtitle="Three focused services, one reliable team: general locksmith work, fast car lockout response, and garage door repair and installation across Durham Region."
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
