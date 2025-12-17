"use client";

import { color, motion } from "framer-motion";
import {
  Smartphone,
  Wifi,
  Users,
  Bell,
  Cpu,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";

const features = [
  { icon: KeyRound, text: "Keyless entry convenience" },
  { icon: Wifi, text: "Remote access from anywhere" },
  { icon: Users, text: "Guest access codes" },
  { icon: Bell, text: "Activity logs & notifications" },
  { icon: Cpu, text: "Integration with Alexa, Google Home, Apple HomeKit" },
];

export function SmartLockSpotlight() {
  return (
    <section className="section bg-white" id="smart-locks-spotlight">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image/Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            {/* Placeholder for Smart Lock Image */}
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Background Circle */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--accent-teal)] to-[var(--primary-main)] opacity-10" />

              {/* Main Visual */}
              <div className="relative h-full flex items-center justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-[var(--primary-main)] to-[var(--primary-dark)] shadow-2xl flex items-center justify-center">
                  <Smartphone className="w-32 h-32 md:w-40 md:h-40 text-white" strokeWidth={1} />
                </div>

                {/* Floating Icons */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                >
                  <Wifi className="w-7 h-7 text-[var(--accent-teal)]" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-8 left-8 w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                >
                  <KeyRound className="w-7 h-7 text-[var(--accent-orange)]" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <span  style={{color:"white"}} className="inline-block px-4 py-1 rounded-full bg-[var(--accent-teal)] bg-opacity-10 text-[var(--accent-teal)] text-sm font-medium mb-4">
              Smart Home Security
            </span>

            <h2  className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Upgrade to Smart Security
            </h2>

            <p className="text-lg text-[var(--text-secondary)] mb-6">
              The Future of Home Security is Here
            </p>

            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
              Smart locks offer keyless entry, remote access, and seamless
              integration with your smart home system. We install and configure
              all major brands including{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {theme.services.smartLockBrands.join(", ")}
              </span>
              , and more.
            </p>

            {/* Features List */}
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <feature.icon style={{color:"white"}} className="w-4 h-4 text-[var(--accent-teal)]" />
                  </div>
                  <span className="text-[var(--text-secondary)]">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              as="link"
              href="/services#smart-locks"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              size="lg"
            >
              Explore Smart Locks
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SmartLockSpotlight;
