import type { Metadata } from "next";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = buildMetadata({
  title: "About JD Home Services | Locksmith & Garage Doors, Oshawa",
  description:
    "JD Home Services is an Oshawa, Ontario team focused on locksmith work, car lockout response, and garage door repair and installation across Durham Region.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={withGraph([
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "About", path: "/about/" },
          ]),
        ])}
      />
      <AboutPageContent />
    </>
  );
}
