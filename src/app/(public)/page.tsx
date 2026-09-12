import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import {
  Hero,
  ServicesGrid,
  Clients,
  CompanyPartners,
  WhyChooseUs,
  CarLockoutSpotlight,
  ServiceArea,
  Testimonials,
  FinalCTA,
} from "@/components/sections";

export const metadata: Metadata = buildMetadata({
  title: "Garage Door Repair & Locksmith Oshawa | JD Home Services",
  description:
    "Garage door repair and installation across Oshawa and Durham Region — springs, openers, off-track and noisy doors, new installs. Also locksmith work and 24/7 car lockout help. Call (289) 991-3277.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <Clients />
      <CompanyPartners />
      <WhyChooseUs />
      <CarLockoutSpotlight />
      <ServiceArea />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
