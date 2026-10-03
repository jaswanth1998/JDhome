import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  /** Use on dark (navy) backgrounds. */
  light?: boolean;
  /** Heading level; defaults to h2. */
  as?: "h1" | "h2";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  light = false,
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-4", light && "eyebrow-light", align === "center" && "justify-center")}>
          {eyebrow}
        </p>
      )}
      <Tag className={cn("text-balance text-3xl md:text-[2.5rem] md:leading-[1.1]", light ? "text-white" : "text-ink")}>
        {title}
      </Tag>
      {subtitle && (
        <p className={cn("mt-4 text-pretty text-lg leading-relaxed", light ? "text-white/75" : "text-ink-2")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
