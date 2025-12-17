"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  text: string;
  description: string;
  icon: string;
  className?: string;
}

export function TrustBadge({
  text,
  description,
  icon,
  className,
}: TrustBadgeProps) {
  const IconComponent = Icons[icon as keyof typeof Icons] as Icons.LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn("text-center", className)}
    >
      {/* Icon Container */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center">
        {IconComponent && (
          <IconComponent
          style={{color:"white"}}
            className="w-8 h-8 text-[var(--accent-teal)]"
            strokeWidth={1.5}
          />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {text}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default TrustBadge;
