import { Header, Footer, MobileCallButton } from "@/components/layout";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileCallButton />
    </>
  );
}
