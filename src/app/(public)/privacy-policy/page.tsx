import type { Metadata } from "next";
import { theme } from "@/config/theme";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for JD Home Services, including how we collect, use, and protect personal information shared through our website, phone, and WhatsApp messaging service.",
};

const LAST_UPDATED = "June 30, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-white/80">
              How {theme.brand.name} collects, uses, and protects your personal
              information.
            </p>
            <p className="text-sm text-white/60 mt-4">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto privacy-content text-[var(--text-secondary)] leading-relaxed space-y-8">
            <div className="space-y-4">
              <p>
                {theme.brand.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                &ldquo;our&rdquo;) operates the website{" "}
                <a href={theme.seo.siteUrl}>{theme.seo.siteUrl}</a> and provides
                locksmith, car lockout, and garage door repair and installation
                services in {theme.contact.address.city},{" "}
                {theme.contact.address.region}, {theme.contact.address.country}.
                This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you visit our website, contact
                us by phone or email, or communicate with us through our WhatsApp
                messaging service.
              </p>
              <p>
                We are committed to protecting your personal information in
                accordance with Canada&rsquo;s Personal Information Protection
                and Electronic Documents Act (PIPEDA) and applicable provincial
                privacy laws. By using our website or messaging services, you
                agree to the collection and use of information in accordance with
                this policy.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                1. Information We Collect
              </h2>
              <p>
                We collect information that you voluntarily provide to us and
                certain information automatically when you interact with our
                services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Contact information</strong> — such as your name,
                  phone number, email address, and service address that you
                  provide when requesting a quote, booking a service, or
                  contacting us.
                </li>
                <li>
                  <strong>WhatsApp and messaging content</strong> — the messages,
                  photos, and details you send us through WhatsApp or other
                  messaging channels, including your WhatsApp phone number and
                  display name, so we can respond to your inquiry and provide our
                  services.
                </li>
                <li>
                  <strong>Service details</strong> — information about the
                  service you request (for example, the type of lock, vehicle, or
                  garage door issue) and your location to the extent needed to
                  schedule and complete the job.
                </li>
                <li>
                  <strong>Payment and invoicing information</strong> — details
                  needed to issue invoices or estimates and process payment for
                  services rendered.
                </li>
                <li>
                  <strong>Automatically collected information</strong> — basic
                  technical data such as browser type, device information, and
                  usage analytics when you visit our website.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                2. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to your inquiries, quotes, and service requests;</li>
                <li>
                  Communicate with you about appointments, scheduling, arrival
                  updates, and follow-ups, including through WhatsApp;
                </li>
                <li>Provide, perform, and complete the services you request;</li>
                <li>Prepare estimates, invoices, and process payments;</li>
                <li>
                  Improve our website, services, and customer experience; and
                </li>
                <li>
                  Comply with legal obligations and protect our legal rights.
                </li>
              </ul>
              <p>
                We will only send you marketing or promotional messages if you
                have given us consent to do so, and you may withdraw that consent
                at any time.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                3. WhatsApp Messaging Service
              </h2>
              <p>
                We use the WhatsApp Business Platform, provided by Meta Platforms,
                Inc. (&ldquo;Meta&rdquo;), to communicate with customers who
                choose to contact us through WhatsApp. When you message us on
                WhatsApp:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Your messages are processed and delivered through WhatsApp&rsquo;s
                  infrastructure and are subject to{" "}
                  <a
                    href="https://www.whatsapp.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp&rsquo;s Privacy Policy
                  </a>{" "}
                  and Meta&rsquo;s data practices in addition to this policy.
                </li>
                <li>
                  We use the contents of your messages and your WhatsApp profile
                  information solely to respond to and fulfil your request.
                </li>
                <li>
                  We may use automated responses or a messaging assistant to help
                  handle common questions and route your request, but you can
                  always reach a member of our team.
                </li>
                <li>
                  <strong>Opt-in:</strong> We will only send you WhatsApp messages
                  after you initiate contact with us or otherwise provide your
                  consent to be contacted on WhatsApp.
                </li>
                <li>
                  <strong>Opt-out:</strong> You can stop receiving WhatsApp
                  messages from us at any time by replying &ldquo;STOP,&rdquo;
                  telling us you no longer wish to be contacted, or blocking our
                  number within WhatsApp.
                </li>
              </ul>
              <p>
                We do not control WhatsApp or Meta&rsquo;s independent collection
                and use of data. Please review WhatsApp&rsquo;s policies to
                understand how they handle your information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                4. How We Share Your Information
              </h2>
              <p>
                We do not sell, rent, or trade your personal information. We may
                share your information only in the following limited
                circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Service providers</strong> — with trusted third parties
                  that help us operate our business, such as messaging platforms
                  (WhatsApp/Meta), website hosting, database and storage providers,
                  and email delivery services, only to the extent needed to
                  perform their services on our behalf.
                </li>
                <li>
                  <strong>Legal requirements</strong> — when required to comply
                  with applicable law, regulation, legal process, or enforceable
                  governmental request.
                </li>
                <li>
                  <strong>Protection of rights</strong> — to enforce our terms,
                  protect the safety of any person, or protect our legal rights
                  and property.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                5. Data Retention
              </h2>
              <p>
                We retain your personal information only for as long as necessary
                to fulfil the purposes described in this policy, including
                providing services, maintaining business and accounting records,
                and complying with our legal obligations. When information is no
                longer required, we securely delete or anonymize it.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                6. Data Security
              </h2>
              <p>
                We use reasonable administrative, technical, and physical
                safeguards designed to protect your personal information against
                unauthorized access, use, or disclosure. However, no method of
                transmission over the Internet or electronic storage is completely
                secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                7. Your Privacy Rights
              </h2>
              <p>
                Subject to applicable law, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you;</li>
                <li>
                  Request correction of inaccurate or incomplete information;
                </li>
                <li>
                  Withdraw your consent to our use of your information or to being
                  contacted (including by WhatsApp); and
                </li>
                <li>
                  Request deletion of your personal information, subject to our
                  legal and record-keeping obligations.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the
                details below. We will respond within a reasonable timeframe as
                required by applicable law.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                8. Children&rsquo;s Privacy
              </h2>
              <p>
                Our services are not directed to individuals under the age of 18,
                and we do not knowingly collect personal information from
                children. If you believe a child has provided us with personal
                information, please contact us so we can remove it.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                9. Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party websites or services
                that we do not operate. We are not responsible for the privacy
                practices of those third parties, and we encourage you to review
                their privacy policies.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                10. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated &ldquo;Last
                updated&rdquo; date. We encourage you to review this policy
                periodically.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                11. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or how we
                handle your personal information, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li>
                  <strong>{theme.brand.name}</strong>
                </li>
                <li>
                  Email:{" "}
                  <a href={`mailto:${theme.contact.email}`}>
                    {theme.contact.email}
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a href={`tel:${theme.contact.phone.tel}`}>
                    {theme.contact.phone.display}
                  </a>
                </li>
                <li>
                  Location: {theme.contact.address.city},{" "}
                  {theme.contact.address.region}, {theme.contact.address.country}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
