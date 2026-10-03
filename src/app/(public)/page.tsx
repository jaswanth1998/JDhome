import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { GuidesStrip } from "@/components/blog";
import { getPost } from "@/lib/blog";
import {
  Hero,
  TrustStrip,
  ServicesShowcase,
  HowItWorks,
  Testimonials,
  ServiceArea,
  FinalCTA,
} from "@/components/sections";

export const metadata: Metadata = buildMetadata({
  title: "Garage Door & Camera Installation & Repair Oshawa | JD Home",
  description:
    "Garage door and security camera installation and repair in Oshawa, Durham Region, and surrounding areas. Local experts, free quotes: (289) 991-3277.",
  path: "/",
});

const featuredGuideSlugs = ["broken-garage-door-spring", "home-security-camera-system-guide", "garage-door-wont-open"];

export default function Home() {
  const featuredGuides = featuredGuideSlugs.map(getPost).filter((post) => post !== undefined);
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesShowcase />
      <HowItWorks />
      <Testimonials />
      <ServiceArea />
      <GuidesStrip
        posts={featuredGuides}
        title="Answers to common garage door and camera questions"
        subtitle="Practical guides from our team, written for Durham Region homes and businesses."
      />
      <FinalCTA />
    </>
  );
}
