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
  title: "Locksmith & Garage Door Repair Oshawa | JD Home Services",
  description:
    "Oshawa locksmith for lock changes and rekeying, 24/7 car lockout help, and garage door repair and installation across Durham Region. Call (289) 991-3277.",
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
