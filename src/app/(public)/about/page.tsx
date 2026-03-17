import type { Metadata } from "next";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About JD Home Solutions | Licensed Locksmith ONTARIO",
  description:
    "Learn about JD Home Solutions, Oshawa's trusted provider for locksmith service, car lockouts, and garage door repair and installation across Durham Region.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
