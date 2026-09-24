import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceChipProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: "radio" | "checkbox";
  label: string;
}

/** A radio/checkbox styled as a selectable pill. Works with react-hook-form `register`. */
export const ChoiceChip = forwardRef<HTMLInputElement, ChoiceChipProps>(
  ({ type = "radio", label, className, ...props }, ref) => (
    <label className={cn("relative cursor-pointer", className)}>
      <input ref={ref} type={type} className="peer sr-only" {...props} />
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white px-3.5 py-2 text-sm font-medium text-ink-2 transition-colors",
          "hover:border-navy-600 peer-checked:border-navy-800 peer-checked:bg-navy-800 peer-checked:text-white",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500",
          "[&>svg]:hidden peer-checked:[&>svg]:block",
        )}
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>
    </label>
  ),
);

ChoiceChip.displayName = "ChoiceChip";
