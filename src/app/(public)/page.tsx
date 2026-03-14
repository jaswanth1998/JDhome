import {
  Hero,
  ServicesGrid,
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
      <WhyChooseUs />
      <SmartLockSpotlight />
      <ServiceArea />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
