"use client";

import { motion } from "framer-motion";
import { Phone, FileText } from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";

export function FinalCTA() {
  return (
    <section className="section bg-gradient-hero text-white" id="contact-cta">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Need a Locksmith? We&apos;re Here to Help.
          </motion.h2>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-white/80 mb-10"
          >
            Call now for immediate assistance or request a free quote for your
            project
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              as="a"
              href={`tel:${theme.contact.phone.tel}`}
              variant="emergency"
              icon={Phone}
              size="lg"
              className="min-w-[240px]"
            >
              Call Now: {theme.contact.phone.display}
            </Button>

            <Button
              as="link"
              href="/contact"
              variant="primary"
              icon={FileText}
              size="lg"
              className="min-w-[240px] bg-white text-[var(--primary-main)] hover:bg-white/90"
            >
              Get Free Quote
            </Button>
          </motion.div>

          {/* Emergency Notice */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-white/70 text-sm"
          >
            <span className="text-[var(--accent-orange)] font-semibold">
              24/7 Emergency Service
            </span>{" "}
            available for lockouts in Oshawa & Durham Region
          </motion.p>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
