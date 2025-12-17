"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  author: string;
  service: string;
  rating: number;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  service,
  rating,
  className,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-white rounded-lg border border-[var(--border-light)] p-6",
        "shadow-sm hover:shadow-md transition-shadow duration-300",
        className
      )}
    >
      {/* Quote Icon */}
      <Quote className="w-8 h-8 text-[var(--accent-teal)] opacity-30 mb-4" />

      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-5 h-5",
              i < rating
                ? "text-[var(--accent-teal)] fill-[var(--accent-teal)]"
                : "text-[var(--neutral-gray)]"
            )}
          />
        ))}
      </div>

      {/* Quote Text */}
      <blockquote className="text-[var(--text-secondary)] leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-3">
        {/* Avatar with Initials */}
        <div className="w-10 h-10 rounded-full bg-[var(--primary-main)] flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(author)}
        </div>

        <div>
          <p className="font-semibold text-[var(--text-primary)]">{author}</p>
          <p className="text-sm text-[var(--text-muted)]">{service}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default TestimonialCard;
