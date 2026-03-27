import type { Metadata } from "next";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = {
  title: "Locksmith Services Durham and surrounding areas | Locksmith, Car Lockout, Garage Doors",
  description:
    "Professional locksmith services in Durham and surrounding areas, including general locksmith work, fast car lockout service, and garage door repair and installation.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
