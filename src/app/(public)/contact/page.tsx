import type { Metadata } from "next";
import { ContactPageContent } from "./ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us | Locksmith Oshawa | Get Free Quote",
  description:
    "Contact JD Home Solutions for locksmith service, car lockout help, and garage door repair in Oshawa and Durham Region. Request a free quote today.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
