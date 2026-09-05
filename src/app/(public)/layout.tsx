import {
  Header,
  Footer,
  MobileCallButton,
  MotionProvider,
} from "@/components/layout";
import { JsonLd } from "@/components/seo";
import { buildSiteGraph } from "@/lib/jsonld";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MotionProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[var(--primary-main)] focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileCallButton />
      <JsonLd data={buildSiteGraph()} />
    </MotionProvider>
  );
}
