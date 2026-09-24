import type { Metadata } from "next";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { ServicesPageContent } from "./ServicesPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Garage Door, CCTV & Locksmith Services | Oshawa, ON",
  description:
    "Garage door repair and installation and smart security camera systems from an Oshawa-based team, plus locksmith work and 24/7 car lockout help as add-ons.",
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
