import type { Metadata } from "next";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Locksmith, Car Lockout & Garage Door Services | Oshawa, ON",
  description:
    "Three core services from an Oshawa-based team: residential and commercial locksmith work, 24/7 car lockout help, and garage door repair and installation.",
  path: "/services/",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={withGraph([
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services/" },
          ]),
        ])}
      />
      <ServicesPageContent />
    </>
  );
}
