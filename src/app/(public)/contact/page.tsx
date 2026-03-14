import type { Metadata } from "next";
import { ContactPageContent } from "./ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us | Locksmith Oshawa | Get Free Quote",
  description:
    "Contact JD Home Solutions for locksmith services in Oshawa. 24/7 emergency lockouts, smart locks, and more. Request a free quote today.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
