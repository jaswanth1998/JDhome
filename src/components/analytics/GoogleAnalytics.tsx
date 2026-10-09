import Script from "next/script";
import { theme } from "@/config/theme";

/**
 * Google Analytics 4 tag. Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID
 * is set at build time (the value is inlined by the static export).
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!theme.features.analytics || !measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
