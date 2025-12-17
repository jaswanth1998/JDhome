"use client";

import { color, motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Clock,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { theme } from "@/config/theme";
import { Button, SectionHeading } from "@/components/ui";
import { FinalCTA } from "@/components/sections";

const whyChooseUs = [
  {
    icon: ShieldCheck,
    title: "Licensed & Insured",
    description:
      "Fully licensed, bonded, and insured for your protection and peace of mind.",
  },
  {
    icon: Clock,
    title: "Fast Response",
    description:
      "Quick response times with 24/7 emergency availability for lockouts.",
  },
  {
    icon: Award,
    title: "Expert Technicians",
    description:
      "Skilled professionals with years of experience in locksmith services.",
  },
  {
    icon: Users,
    title: "Customer Focused",
    description:
      "Dedicated to providing exceptional service and complete satisfaction.",
  },
];

const values = [
  "Integrity in every interaction",
  "Quality workmanship guaranteed",
  "Transparent and fair pricing",
  "Ongoing education in security technology",
  "Commitment to customer satisfaction",
  "Respect for your property and time",
];

const serviceAreas = theme.contact.address.fullServiceArea.split(", ");

export function AboutPageContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center" >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            
            >
              Trusted Locksmith Services in Oshawa
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-white/80"
            >
              Combining traditional locksmith expertise with modern smart home
              technology
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-[var(--accent-teal)] bg-opacity-10 text-[var(--accent-teal)] text-sm font-medium mb-4">
                Our Story
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6">
                {theme.brand.tagline}
              </h2>

              <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                <p>
                  {theme.brand.name} was founded with a simple mission: provide
                  Oshawa residents with trustworthy, professional locksmith
                  services they can rely on. From emergency lockouts to
                  cutting-edge smart lock installations, we treat every job with
                  the same dedication to quality and customer satisfaction.
                </p>
                <p>
                  As the smart home revolution transforms residential security,
                  we&apos;ve positioned ourselves at the forefront – offering both
                  traditional locksmith expertise and modern smart home
                  integration. Whether you need a simple lock replacement or a
                  comprehensive smart security system, we deliver results that
                  are finished to perfection.
                </p>
                <p>
                  Our commitment to ongoing education ensures we stay current
                  with the latest security technologies, allowing us to provide
                  you with the best solutions for your home or business.
                </p>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--primary-main)] to-[var(--accent-teal)] opacity-10" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-[var(--primary-main)] flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-5xl md:text-6xl font-bold">JD</div>
                      <div className="text-sm md:text-base mt-2 text-white/80">
                        Home Solutions
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section bg-[var(--bg-secondary)]">
        <div className="container">
          <SectionHeading
            title="Why Choose Us"
            subtitle="We're committed to delivering exceptional service with integrity and professionalism."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-[var(--accent-teal)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Trusted" },
                  { icon: Award, label: "Professional" },
                  { icon: Clock, label: "Reliable" },
                  { icon: Users, label: "Dedicated" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="aspect-square rounded-2xl bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-6"
                  >
                    <item.icon className="w-12 h-12 text-[var(--accent-teal)] mb-3" />
                    <span className="font-semibold text-[var(--text-primary)]">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-[var(--accent-teal)] bg-opacity-10 text-[var(--accent-teal)] text-sm font-medium mb-4">
                Our Values
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6">
                What We Stand For
              </h2>

              <ul className="space-y-4">
                {values.map((value, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-[var(--accent-teal)] flex-shrink-0" />
                    <span className="text-[var(--text-secondary)]">{value}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="section bg-[var(--primary-main)] text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center"
            >
              <MapPin className="w-8 h-8 text-[var(--accent-teal)]" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Our Service Area
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white/80 mb-8"
            >
              Proudly serving Oshawa and throughout Durham Region
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-10"
            >
              {serviceAreas.map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium"
                >
                  {area}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                as="a"
                href={`tel:${theme.contact.phone.tel}`}
                variant="emergency"
                icon={Phone}
                size="lg"
              >
                Call: {theme.contact.phone.display}
              </Button>

              <Button
                as="link"
                href="/contact"
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                size="lg"
              >
                Get in Touch
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}

export default AboutPageContent;
