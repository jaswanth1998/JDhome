"use client";

import { motion } from "framer-motion";
import {
  Car,
  Clock3,
  MapPinned,
  ShieldCheck,
  Phone,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  { icon: Clock3, text: "24/7 response for urgent car lockouts" },
  { icon: ShieldCheck, text: "Damage-free entry whenever possible" },
  { icon: MapPinned, text: "Coverage across Durham and surrounding areas" },
  { icon: Wrench, text: "Help with stuck locks and key access issues" },
  { icon: Phone, text: "Direct phone support when you need help fast" },
];

export function SmartLockSpotlight() {
  return (
    <section className="section bg-white" id="car-lockout-spotlight">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--primary-main)] opacity-10" />

              <div className="relative h-full flex items-center justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-[var(--primary-main)] to-[var(--primary-dark)] shadow-2xl flex items-center justify-center">
                  <Car className="w-32 h-32 md:w-40 md:h-40 text-white" strokeWidth={1} />
                </div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                >
                  <Clock3 className="w-7 h-7 text-[var(--accent-teal)]" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-8 left-8 w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                >
                  <Phone className="w-7 h-7 text-[var(--accent-orange)]" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-[var(--accent-teal)] bg-opacity-10 text-[var(--accent-teal)] text-sm font-medium mb-4">
              Rapid Response
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Locked Out of Your Car?
            </h2>

            <p className="text-lg text-[var(--text-secondary)] mb-6">
              Fast help without the extra stress
            </p>

            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
              When your keys are locked inside the vehicle, speed matters. We
              provide car lockout service across Durham and surrounding areas with a
              focus on quick arrival, careful entry, and clear communication.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              as="link"
              href="/services#car-lockout"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              size="lg"
            >
              Explore Car Lockout Service
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SmartLockSpotlight;
