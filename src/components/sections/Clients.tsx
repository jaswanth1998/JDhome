"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { theme } from "@/config/theme";
import { SectionHeading } from "@/components/ui";

type ClientSegment = {
  id: string;
  name: string;
  description: string;
  icon: string;
  highlights: readonly string[];
};

const clientSegments = theme.clients.segments as readonly ClientSegment[];

export function Clients() {
  return (
    <section className="section bg-[var(--bg-secondary)]" id="clients">
      <div className="container">
        <SectionHeading
          title="Clients We Commonly Help"
          subtitle="From homeowners and rental properties to storefronts and vehicle owners, we bring the same clear communication and dependable workmanship to every job."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {clientSegments.map((segment, index) => {
            const IconComponent = Icons[
              segment.icon as keyof typeof Icons
            ] as Icons.LucideIcon | undefined;

            return (
              <motion.article
                key={segment.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="group h-full rounded-3xl border border-[var(--border-light)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-main)] text-white shadow-md">
                    {IconComponent ? (
                      <IconComponent className="h-6 w-6" strokeWidth={1.75} />
                    ) : null}
                  </div>

                  <span className="rounded-full border border-[var(--border-light)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-teal)]">
                    Client Type
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
                  {segment.name}
                </h3>

                <p className="mb-5 text-sm leading-6 text-[var(--text-secondary)]">
                  {segment.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {segment.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-[var(--bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Clients;
