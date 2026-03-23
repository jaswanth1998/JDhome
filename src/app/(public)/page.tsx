import {
  Hero,
  ServicesGrid,
  Clients,
  CompanyPartners,
  WhyChooseUs,
  SmartLockSpotlight,
  ServiceArea,
  Testimonials,
  FinalCTA,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <Clients />
      <CompanyPartners />
      <WhyChooseUs />
      <SmartLockSpotlight />
      <ServiceArea />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
