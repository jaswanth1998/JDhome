import type { Metadata } from "next";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = {
  title: "Locksmith Services Oshawa and Durham | Smart Locks, Emergency, Garage Doors",
  description:
    "Complete locksmith services in Oshawa and Durham: smart lock installation, emergency lockouts, high-security systems, garage door openers, and rekeying. Licensed & insured.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
