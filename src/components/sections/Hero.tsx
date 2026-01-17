"use client";

import { motion } from "framer-motion";
import { Phone, FileText, ShieldCheck, Clock, Award } from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";

const trustBadges = [
  { icon: ShieldCheck, text: "Licensed & Insured" },
  { icon: Clock, text: "Fast Response Time" },
  { icon: Award, text: "100% Satisfaction Guaranteed" },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-main)] via-[var(--primary-dark)] to-[var(--primary-main)] opacity-95" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance"
              style={{ color: "white" }}
          >
            Oshawa&apos;s and Durham&apos;s Trusted Locksmith &{" "}
            <span className="text-[var(--accent-teal)]">Smart Home Security</span>{" "}
            Experts
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-white/80 mb-10"
          >
            {theme.brand.tagline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
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
              className="min-w-[240px]"
            >
              Get a Free Quote
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-white/90"
              >
                <badge.icon className="w-5 h-5 text-[var(--accent-teal)]" />
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 md:h-24"
          viewBox="0 0 1440 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50L48 45.7C96 41.3 192 32.7 288 30.2C384 27.7 480 31.3 576 39.2C672 47 768 59 864 59C960 59 1056 47 1152 41.3C1248 35.7 1344 36.3 1392 36.7L1440 37V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

export default Hero;
