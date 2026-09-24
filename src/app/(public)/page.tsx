import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { GuidesStrip } from "@/components/blog";
import { getPost } from "@/lib/blog";
import {
  Hero,
  TrustStrip,
  CoreServices,
  SmartSecurity,
  GarageProblems,
  Process,
  AddOnServices,
  WhoWeHelp,
  Testimonials,
  ServiceArea,
  FinalCTA,
} from "@/components/sections";

export const metadata: Metadata = buildMetadata({
  title: "Garage Door Repair & Security Cameras Oshawa | JD Home",
  description:
    "Garage door repair and installation plus smart security cameras in Oshawa and Durham Region. Locksmith and 24/7 car lockout too. Call (289) 991-3277.",
  path: "/",
});

const featuredGuideSlugs = ["broken-garage-door-spring", "home-security-camera-system-guide", "garage-door-wont-open"];

export default function Home() {
  const featuredGuides = featuredGuideSlugs.map(getPost).filter((post) => post !== undefined);
  return (
    <>
      <Hero />
      <TrustStrip />
      <CoreServices />
      <SmartSecurity />
      <GarageProblems />
      <Process />
      <AddOnServices />
      <WhoWeHelp />
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
