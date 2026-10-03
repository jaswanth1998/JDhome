/* eslint-disable @next/next/no-img-element -- static export serves images unoptimized */
import { imageSrcSet, imageUrl, siteImages, type SiteImageKey } from "@/config/images";
import { cn } from "@/lib/utils";

interface PhotoProps {
  image: SiteImageKey;
  /** Width / height ratio used to crop the image on the CDN. */
  aspect?: number;
  /** `sizes` attribute describing the rendered width. */
  sizes?: string;
  /** Load immediately (above the fold). */
  priority?: boolean;
  /** Empty alt for decorative use. */
  decorative?: boolean;
  className?: string;
  imgClassName?: string;
}

const WIDTHS = [480, 768, 1080, 1440, 1920] as const;

/** A responsive, CDN-cropped photo from `src/config/images.ts`. */
export function Photo({
  image,
  aspect,
  sizes = "100vw",
  priority = false,
  decorative = false,
  className,
  imgClassName,
}: PhotoProps) {
  const { alt } = siteImages[image];
  // Intrinsic size hints; the rendered size comes from CSS (object-fit: cover).
  const width = 1200;
  const height = Math.round(width / (aspect ?? 16 / 9));
  return (
    <div className={cn("photo", className)}>
      <img
        src={imageUrl(image, width, aspect ? height : undefined)}
        srcSet={imageSrcSet(image, WIDTHS, aspect)}
        sizes={sizes}
        width={width}
        height={height}
        alt={decorative ? "" : alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={imgClassName}
      />
    </div>
  );
}

export default Photo;
