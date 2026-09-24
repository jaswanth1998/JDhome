import type { Metadata } from "next";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { ContactPageContent } from "./ContactPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Contact JD Home Services | Free Quote | Oshawa",
  description:
    "Request a free quote for garage door repair, security cameras, locksmith work, or car lockout help in Oshawa and Durham Region. Call (289) 991-3277.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={withGraph([
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact/" },
          ]),
        ])}
      />
      <ContactPageContent />
    </>
  );
}
