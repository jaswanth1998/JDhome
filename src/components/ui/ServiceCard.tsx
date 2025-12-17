"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  id: string;
  name: string;
  shortDescription: string;
  icon: string;
  color: string;
  badge?: string;
  featured?: boolean;
  className?: string;
}

export function ServiceCard({
  id,
  name,
  shortDescription,
  icon,
  color,
  badge,
  className,
}: ServiceCardProps) {
  // Dynamically get the icon component
  const IconComponent = Icons[icon as keyof typeof Icons] as Icons.LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/services#${id}`} className="block h-full">
        <div
          className={cn(
            "group relative h-full bg-white rounded-lg border border-[var(--border-light)] p-6",
            "transition-all duration-300 ease-in-out",
            "hover:shadow-lg hover:-translate-y-1",
            className
          )}
        >
          {/* Badge */}
          {badge && (
            <span className="absolute top-4 right-4 badge badge-emergency text-xs">
              {badge}
            </span>
          )}

          {/* Icon */}
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: `${color}15` }}
          >
            {IconComponent && (
              <IconComponent
                className="w-7 h-7"
                style={{ color }}
                strokeWidth={1.5}
              />
            )}
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-teal)] transition-colors">
            {name}
          </h3>

          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
            {shortDescription}
          </p>

          {/* Link */}
          <div className="flex items-center text-[var(--accent-teal)] text-sm font-medium group-hover:gap-2 transition-all">
            <span>{badge ? "Call Now" : "Learn More"}</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ServiceCard;
