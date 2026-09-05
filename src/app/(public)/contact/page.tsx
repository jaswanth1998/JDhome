import type { Metadata } from "next";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { ContactPageContent } from "./ContactPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Contact JD Home Services | Locksmith Oshawa | Free Quote",
  description:
    "Call (289) 991-3277 or send a message to book locksmith service, 24/7 car lockout help, or garage door repair in Oshawa and Durham Region.",
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
