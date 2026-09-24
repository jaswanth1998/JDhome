"use client";

import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";
import type { InquiryService } from "@/lib/inquiries/schema";
import { useInquiry } from "./InquiryProvider";

interface InquiryButtonProps {
  service?: InquiryService;
  variant?: "gold" | "navy" | "outline" | "ghost-light";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon | null;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** Opens the quote request dialog. Safe to drop into server components. */
export function InquiryButton({
  service,
  variant = "gold",
  size = "md",
  icon = ArrowRight,
  fullWidth,
  className,
  children = "Get a free quote",
}: InquiryButtonProps) {
  const { openInquiry } = useInquiry();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      icon={icon ?? undefined}
      iconPosition="right"
      fullWidth={fullWidth}
      className={className}
      onClick={() => openInquiry(service)}
    >
      {children}
    </Button>
  );
}

export default InquiryButton;
