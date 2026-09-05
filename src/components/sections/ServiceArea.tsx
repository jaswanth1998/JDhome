"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { Button } from "@/components/ui";

const serviceCities: readonly ServiceCity[] = theme.serviceCities;

export function ServiceArea() {
  return (
    <section className="section bg-[var(--primary-main)]" id="service-area">
      <div className="container">
        <div className="text-center text-white">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center"
          >
            <MapPin className="w-8 h-8 text-[var(--accent-teal)]" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
          >
           Serving Durham & Surrounding areas
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
          >
            Based in Oshawa, we provide locksmith service, car lockout response,
            and garage door repair and installation throughout Durham Region.
          </motion.p>

          {/* Service Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-10"
          >
            {serviceCities.map((city) => (
              <Link
                key={city.slug}
                href={city.core ? `/service-areas/${city.slug}/` : "/service-areas/"}
                className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              as="link"
              href="/service-areas/"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              size="lg"
            >
              See All Service Areas
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ServiceArea;
