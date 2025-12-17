"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { theme } from "@/config/theme";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const serviceLinks = [
  { name: "Smart Lock Installation", href: "/services#smart-locks" },
  { name: "Emergency Lockout", href: "/services#emergency" },
  { name: "Lock Replacement", href: "/services#installation" },
  { name: "Garage Door Services", href: "/services#garage-door" },
  { name: "High-Security Systems", href: "/services#high-security" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-dark)] text-[var(--neutral-light-gray)]">
      {/* Main Footer Content */}
      <div className="container section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Company Info */}
          <div>
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-white mb-4"
            >
              <div className="w-10 h-10 bg-[var(--accent-teal)] rounded-lg flex items-center justify-center text-white font-bold">
                JD
              </div>
              <span>{theme.brand.name}</span>
            </Link>

            {/* Tagline */}
            <p className="text-[var(--neutral-gray)] mb-6">
              {theme.brand.tagline}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {theme.contact.social.instagram && (
                <a
                  href={theme.contact.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[var(--accent-teal)] transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {theme.contact.social.facebook && (
                <a
                  href={theme.contact.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[var(--accent-teal)] transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--neutral-gray)] hover:text-[var(--accent-teal)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--neutral-gray)] hover:text-[var(--accent-teal)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              {/* Phone */}
              <li>
                <a
                  href={`tel:${theme.contact.phone.tel}`}
                  className="flex items-start gap-3 text-[var(--neutral-gray)] hover:text-[var(--accent-teal)] transition-colors group"
                >
                  <Phone className="w-5 h-5 mt-0.5 text-[var(--accent-teal)]" />
                  <span className="font-medium text-white group-hover:text-[var(--accent-teal)]">
                    {theme.contact.phone.display}
                  </span>
                </a>
              </li>

              {/* Email */}
              <li>
                <a
                  href={`mailto:${theme.contact.email}`}
                  className="flex items-start gap-3 text-[var(--neutral-gray)] hover:text-[var(--accent-teal)] transition-colors"
                >
                  <Mail className="w-5 h-5 mt-0.5 text-[var(--accent-teal)]" />
                  <span>{theme.contact.email}</span>
                </a>
              </li>

              {/* Service Area */}
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-[var(--accent-teal)]" />
                <span>{theme.contact.address.serviceArea}</span>
              </li>

              {/* Hours */}
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 text-[var(--accent-teal)]" />
                <div>
                  <p>{theme.contact.hours.regular.display}</p>
                  <p className="text-[var(--accent-orange)] font-medium">
                    {theme.contact.hours.emergency.display}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--neutral-gray)]">
            <p>
              &copy; {currentYear} {theme.brand.name}. All rights reserved.
            </p>
            <p>
              Proudly serving {theme.contact.address.city}, {theme.contact.address.region}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
