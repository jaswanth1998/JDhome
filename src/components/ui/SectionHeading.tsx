"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  title,
  subtitle,
  centered = true,
  light = false,
  className,
  as = "h2",
}: SectionHeadingProps) {
  const Tag = as;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "mb-12",
        centered && "text-center",
        className
      )}
    >
      <Tag
        className={cn(
          "text-3xl md:text-4xl font-bold mb-4",
          light ? "text-white" : "text-[var(--text-primary)]"
        )}
      >
        {title}
      </Tag>

      {subtitle && (
        <p
          className={cn(
            "text-lg max-w-2xl",
            centered && "mx-auto",
            light ? "text-white/80" : "text-[var(--text-secondary)]"
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default SectionHeading;
