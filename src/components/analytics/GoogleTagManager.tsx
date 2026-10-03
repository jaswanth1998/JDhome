import Script from "next/script";
import { theme } from "@/config/theme";

/** GTM container ID: build-time env override first, then the theme default. Empty when analytics are disabled. */
export function getGtmId(): string | undefined {
  if (!theme.features.analytics) return undefined;
  return process.env.NEXT_PUBLIC_GTM_ID || theme.analytics.gtmId || undefined;
}

/**
 * Google Tag Manager loader (the <head> half of Google's snippet). next/script
 * injects it after hydration, so it can live anywhere in the root layout body.
 */
export function GoogleTagManager() {
  const gtmId = getGtmId();
  if (!gtmId) return null;

  return (
    <Script id="gtm-init" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
    </Script>
  );
}

/** The <noscript> iframe half of Google's snippet; render it as the first child of <body>. */
export function GoogleTagManagerNoScript() {
  const gtmId = getGtmId();
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
