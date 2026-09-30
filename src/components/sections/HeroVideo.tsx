"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Photo } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Pexels clip "Drone Outdoor Home" (free Pexels License, no attribution required):
 * a slow drone rise past evergreens revealing a two-storey home with a garage door.
 * https://www.pexels.com/video/drone-outdoor-home-17171031/ (~1 MB, 23 s)
 */
const VIDEO_SRC = "https://videos.pexels.com/video-files/17171031/17171031-sd_960_540_30fps.mp4";

/** Matches the hero's `lg` breakpoint, where the desktop photo takes over. */
const MOBILE_QUERY = "(max-width: 1023.98px)";

/**
 * Looping video banner for the phone/tablet hero (hidden on desktop, which keeps its
 * photo). The garage photo shows first; the video is only attached after hydration,
 * on small screens, and never with reduced motion or data saver on, then fades in
 * once it is actually playing. Desktop visitors never download it.
 */
export function HeroVideo({ className, children }: { className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (
      !window.matchMedia(MOBILE_QUERY).matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      connection?.saveData
    ) {
      return;
    }
    const play = () => {
      video.play().catch(() => {
        // Autoplay blocked (e.g. low-power mode): the photo stays, which is fine.
      });
    };
    // Browsers pause muted videos in background tabs; pick up again on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };
    video.src = VIDEO_SRC;
    play();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <div
      className={cn(
        "relative aspect-[2/1] overflow-hidden min-[380px]:aspect-[16/9] rounded-[var(--radius-xl)] bg-paper-cool shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <Photo
        image="heroGarage"
        aspect={16 / 9}
        sizes="(min-width: 640px) 576px, 100vw"
        decorative
        className="absolute inset-0 rounded-none"
        imgClassName="object-[70%_50%]"
      />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          playing ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-950/60 to-transparent"
        aria-hidden="true"
      />
      {children && <div className="absolute inset-x-3 bottom-3">{children}</div>}
    </div>
  );
}

export default HeroVideo;
