import {
  Header,
  Footer,
  MobileCallButton,
  MotionProvider,
} from "@/components/layout";
import { InquiryProvider } from "@/components/inquiry";
import { JsonLd } from "@/components/seo";
import { buildSiteGraph } from "@/lib/jsonld";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MotionProvider>
      <InquiryProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-navy-800 focus:shadow-lg"
        >
          Skip to main content
        </a>
        <div className="has-mobile-cta">
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <MobileCallButton />
        <JsonLd data={buildSiteGraph()} />
      </InquiryProvider>
    </MotionProvider>
  );
}
