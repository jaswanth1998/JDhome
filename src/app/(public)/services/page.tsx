import type { Metadata } from "next";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = {
  title: "Locksmith Services Oshawa and Durham | Locksmith, Car Lockout, Garage Doors",
  description:
    "Professional locksmith services in Oshawa and Durham Region, including general locksmith work, fast car lockout service, and garage door repair and installation.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
