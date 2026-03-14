import type { Metadata } from "next";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About JD Home Solutions | Licensed Locksmith Oshawa",
  description:
    "Learn about JD Home Solutions, Oshawa's trusted locksmith. Licensed, insured, and specializing in smart home security solutions. Serving Durham Region.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
