"use client";

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "emergency" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: "button";
    href?: never;
  };

type ButtonAsAnchor = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    as: "a";
    href: string;
    target?: string;
    rel?: string;
  };

type ButtonAsLink = BaseButtonProps & {
  as: "link";
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--accent-teal)] text-white
    hover:bg-[var(--accent-teal-hover)]
    hover:shadow-[var(--shadow-primary-glow)]
  `,
  emergency: `
    bg-[var(--accent-orange)] text-white
    hover:bg-[var(--accent-orange-hover)]
    hover:shadow-[var(--shadow-emergency-glow)]
  `,
  secondary: `
    bg-[var(--secondary-main)] text-white
    hover:bg-[var(--secondary-dark)]
  `,
  outline: `
    bg-transparent text-[var(--primary-main)]
    border-2 border-[var(--primary-main)]
    hover:bg-[var(--primary-main)] hover:text-white
  `,
  ghost: `
    bg-transparent text-[var(--text-primary)]
    hover:bg-[var(--neutral-light-gray)]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm h-9",
  md: "px-6 py-3 text-base h-11",
  lg: "px-8 py-4 text-lg h-[52px]",
};

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      isLoading = false,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-150 ease-in-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-teal)] focus-visible:ring-offset-2
      disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none
    `;

    const combinedClassName = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && "w-full",
      className
    );

    const content = (
      <>
        {isLoading && (
          <span className="spinner" aria-hidden="true" />
        )}
        {!isLoading && Icon && iconPosition === "left" && (
          <Icon className="w-5 h-5" aria-hidden="true" />
        )}
        <span>{children}</span>
        {!isLoading && Icon && iconPosition === "right" && (
          <Icon className="w-5 h-5" aria-hidden="true" />
        )}
      </>
    );

    // Render as Link (Next.js internal navigation)
    if (props.as === "link") {
      const { as, href, ...linkProps } = props;
      return (
        <Link
          href={href}
          className={combinedClassName}
          {...linkProps}
        >
          {content}
        </Link>
      );
    }

    // Render as anchor (external links)
    if (props.as === "a") {
      const { as, ...anchorProps } = props;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={combinedClassName}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    // Render as button (default)
    const { as, ...buttonProps } = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClassName}
        disabled={isLoading || buttonProps.disabled}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
