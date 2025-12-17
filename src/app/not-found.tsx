"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Phone } from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center"
        >
          {/* 404 Text */}
          <div className="text-9xl font-bold text-[var(--primary-main)] opacity-20 mb-4">
            404
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Page Not Found
          </h1>

          <p className="text-lg text-[var(--text-secondary)] mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have
            been moved or doesn&apos;t exist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              as="link"
              href="/"
              variant="primary"
              icon={Home}
              size="lg"
            >
              Go to Homepage
            </Button>

            <Button
              as="a"
              href={`tel:${theme.contact.phone.tel}`}
              variant="emergency"
              icon={Phone}
              size="lg"
            >
              Call Us
            </Button>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-8 text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to previous page</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
