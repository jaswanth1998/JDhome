"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Check, Phone, ArrowRight } from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";
import { FinalCTA } from "@/components/sections";

// Type for service with optional badge
type ServiceCategory = (typeof theme.services.categories)[number];
type ServiceWithBadge = ServiceCategory & { badge?: string };

export function ServicesPageContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Professional Locksmith Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-white/80 mb-8"
            >
              From emergency lockouts to smart home security systems, we provide
              comprehensive locksmith services throughout Oshawa and Durham Region.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button
                as="a"
                href={`tel:${theme.contact.phone.tel}`}
                variant="emergency"
                icon={Phone}
                size="lg"
              >
                Call Now: {theme.contact.phone.display}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Detail Sections */}
      {(theme.services.categories as unknown as ServiceWithBadge[]).map((service, index) => {
        const IconComponent = Icons[service.icon as keyof typeof Icons] as Icons.LucideIcon;
        const isEven = index % 2 === 0;

        return (
          <section
            key={service.id}
            id={service.id}
            className={`section ${isEven ? "bg-white" : "bg-[var(--bg-secondary)]"}`}
          >
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Content Side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className={isEven ? "order-1" : "order-1 lg:order-2"}
                >
                  {/* Badge for emergency service */}
                  {service.badge && (
                    <span className="inline-block px-4 py-1 rounded-full bg-[var(--accent-orange)] text-white text-sm font-medium mb-4">
                      {service.badge}
                    </span>
                  )}

                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                    {service.name}
                  </h2>

                  <p className="text-[var(--text-secondary)] mb-8 leading-relaxed text-lg">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                      What&apos;s Included:
                    </h3>
                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${service.color}20` }}
                          >
                            <Check
                              className="w-4 h-4"
                              style={{ color: service.color }}
                            />
                          </div>
                          <span className="text-[var(--text-secondary)]">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Brands (for smart locks and high-security) */}
                  {service.id === "smart-locks" && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                        Popular Smart Lock Brands We Install:
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        {theme.services.smartLockBrands.join(" • ")}
                      </p>
                    </div>
                  )}

                  {service.id === "high-security" && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                        Top High-Security Brands:
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        {theme.services.highSecurityBrands.join(" • ")}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex flex-wrap gap-4">
                    {service.id === "emergency" ? (
                      <Button
                        as="a"
                        href={`tel:${theme.contact.phone.tel}`}
                        variant="emergency"
                        icon={Phone}
                        size="lg"
                      >
                        Call Now: {theme.contact.phone.display}
                      </Button>
                    ) : (
                      <Button
                        as="link"
                        href="/contact"
                        variant="primary"
                        icon={ArrowRight}
                        iconPosition="right"
                        size="lg"
                      >
                        Request This Service
                      </Button>
                    )}
                  </div>
                </motion.div>

                {/* Visual Side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6 }}
                  className={isEven ? "order-2" : "order-2 lg:order-1"}
                >
                  <div className="relative aspect-square max-w-md mx-auto">
                    {/* Background Shape */}
                    <div
                      className="absolute inset-8 rounded-3xl opacity-10"
                      style={{ backgroundColor: service.color }}
                    />

                    {/* Icon Display */}
                    <div className="relative h-full flex items-center justify-center">
                      <div
                        className="w-48 h-48 md:w-64 md:h-64 rounded-3xl shadow-xl flex items-center justify-center"
                        style={{ backgroundColor: service.color }}
                      >
                        {IconComponent && (
                          <IconComponent
                            className="w-24 h-24 md:w-32 md:h-32 text-white"
                            strokeWidth={1}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}

export default ServicesPageContent;
