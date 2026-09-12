import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { theme } from "@/config/theme";
import { GoogleAnalytics, GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: theme.colors.primary.main,
};

export const metadata: Metadata = {
  title: {
    default: theme.seo.defaultTitle,
    template: theme.seo.titleTemplate,
  },
  description: theme.seo.defaultDescription,
  keywords: theme.seo.keywords,
  authors: [{ name: theme.brand.name }],
  creator: theme.brand.name,
  metadataBase: new URL(theme.seo.siteUrl),
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: theme.seo.siteUrl,
    title: theme.seo.defaultTitle,
    description: theme.seo.defaultDescription,
    siteName: theme.brand.name,
    images: [
      {
        url: theme.seo.ogImage,
        width: 1200,
        height: 630,
        alt: theme.brand.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: theme.seo.twitterHandle || undefined,
    creator: theme.seo.twitterHandle || undefined,
    title: theme.seo.defaultTitle,
    description: theme.seo.defaultDescription,
    images: [theme.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <GoogleTagManagerNoScript />
        {children}
        <GoogleTagManager />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
