import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header, Footer, MobileCallButton } from "@/components/layout";
import { theme } from "@/config/theme";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

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
  verification: {
    // Add Google Search Console verification if available
    // google: "verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Schema.org LocalBusiness JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Locksmith",
              name: theme.brand.name,
              description: theme.brand.description,
              url: theme.seo.siteUrl,
              telephone: theme.contact.phone.tel,
              email: theme.contact.email,
              address: {
                "@type": "PostalAddress",
                addressLocality: theme.contact.address.city,
                addressRegion: "ON",
                addressCountry: "CA",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "43.8971",
                longitude: "-78.8658",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "08:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  opens: "00:00",
                  closes: "23:59",
                  description: "Emergency lockout services available 24/7",
                },
              ],
              areaServed: [
                "Oshawa",
                "Whitby",
                "Ajax",
                "Pickering",
                "Courtice",
                "Bowmanville",
                "Durham Region",
              ],
              priceRange: "$$",
              image: `${theme.seo.siteUrl}${theme.seo.ogImage}`,
              sameAs: [
                theme.contact.social.instagram,
                theme.contact.social.facebook,
              ].filter(Boolean),
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Locksmith Services",
                itemListElement: theme.services.categories.map((service) => ({
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: service.name,
                    description: service.shortDescription,
                  },
                })),
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileCallButton />
      </body>
    </html>
  );
}
