import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "gold" | "navy" | "outline" | "ghost-light";
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
  };

type ButtonAsLink = BaseButtonProps & {
  as: "link";
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

const variantClass: Record<ButtonVariant, string> = {
  gold: "btn-gold",
  navy: "btn-primary",
  outline: "btn-outline",
  "ghost-light": "btn-ghost-light",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

/** Button styled with the global `.btn` classes; renders a button, anchor, or Next.js Link. */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "gold",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      isLoading = false,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn("btn", variantClass[variant], sizeClass[size], fullWidth && "w-full", className);

    const content = (
      <>
        {isLoading && <span className="spinner" aria-hidden="true" />}
        {!isLoading && Icon && iconPosition === "left" && <Icon className="h-[18px] w-[18px]" aria-hidden="true" />}
        <span>{children}</span>
        {!isLoading && Icon && iconPosition === "right" && <Icon className="h-[18px] w-[18px]" aria-hidden="true" />}
      </>
    );

    if (props.as === "link") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { as, href, ...linkProps } = props;
      return (
        <Link href={href} className={classes} {...linkProps}>
          {content}
        </Link>
      );
    }

    if (props.as === "a") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { as, ...anchorProps } = props;
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...anchorProps}>
          {content}
        </a>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as, ...buttonProps } = props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={isLoading || buttonProps.disabled}
        {...buttonProps}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
