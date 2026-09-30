"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { theme } from "@/config/theme";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Meta Pixel ID: build-time env override first, then the theme default. Empty when analytics are disabled. */
function getMetaPixelId(): string | undefined {
  if (!theme.features.analytics) return undefined;
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || theme.analytics.metaPixelId || undefined;
}

/** Send a Meta standard event (e.g. "Lead", "Contact"). No-op when the pixel isn't on the page. */
export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  window.fbq?.("track", event, params);
}

/**
 * Meta Pixel for the marketing site. Lives in the public layout so admin pages never report to Meta.
 * The snippet sends the first PageView; client-side route changes send the rest, and any tel:/mailto:
 * link click sends a Contact event.
 */
export function MetaPixel() {
  const pixelId = getMetaPixelId();
  const pathname = usePathname();
  const isFirstPath = useRef(true);

  useEffect(() => {
    if (!pixelId) return;
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname, pixelId]);

  useEffect(() => {
    if (!pixelId) return;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="tel:"], a[href^="mailto:"]');
      if (!link) return;
      const method = link.getAttribute("href")?.startsWith("tel:") ? "phone" : "email";
      trackMetaEvent("Contact", { content_category: method });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
