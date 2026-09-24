import Link from "next/link";
import Image from "next/image";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { theme } from "@/config/theme";
import { coreCities } from "@/lib/seo";
import { getPost } from "@/lib/blog";

const companyLinks = [
  { name: "About Us", href: "/about/" },
  { name: "All Services", href: "/services/" },
  { name: "Service Areas", href: "/service-areas/" },
  { name: "Guides & Advice", href: "/blog/" },
  { name: "Contact", href: "/contact/" },
];

const popularGuideSlugs = [
  "broken-garage-door-spring",
  "garage-door-wont-open",
  "home-security-camera-system-guide",
  "poe-vs-wifi-security-cameras",
];

const linkClass = "text-white/65 transition-colors hover:text-gold-500";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const popularGuides = popularGuideSlugs.map(getPost).filter((post) => post !== undefined);

  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="mb-5 flex items-center gap-3">
              <Image src={theme.brand.logo.markLight} alt={`${theme.brand.name} logo`} width={403} height={337} className="h-10 w-auto" />
              <span className="font-[family-name:var(--font-heading)] text-lg font-extrabold text-white">
                {theme.brand.name}
              </span>
            </Link>
            <p className="max-w-sm text-[0.9375rem] leading-relaxed">
              Garage door repair and installation and smart security camera systems for homes and businesses across
              Durham Region. {theme.brand.tagline}
            </p>
            <div className="mt-6 flex gap-2">
              {theme.contact.social.instagram && (
                <a
                  href={theme.contact.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 transition-colors hover:border-gold-500 hover:text-gold-500"
                  aria-label="JD Home Services on Instagram"
                >
                  <Instagram className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              )}
              {theme.contact.social.facebook && (
                <a
                  href={theme.contact.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 transition-colors hover:border-gold-500 hover:text-gold-500"
                  aria-label="JD Home Services on Facebook"
                >
                  <Facebook className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">Services</h2>
            <ul className="space-y-2.5">
              {theme.services.categories.map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.id}/`} className={linkClass}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-white">Company</h2>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">Areas</h2>
            <ul className="space-y-2.5">
              {coreCities.map((city) => (
                <li key={city.slug}>
                  <Link href={`/service-areas/${city.slug}/`} className={linkClass}>
                    {city.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/service-areas/" className={linkClass}>
                  More areas →
                </Link>
              </li>
            </ul>
            <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-white">Popular guides</h2>
            <ul className="space-y-2.5">
              {popularGuides.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}/`} className={linkClass}>
                    {post.seoTitle.split(/[?:]/)[0]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">Contact</h2>
            <ul className="space-y-4 text-[0.9375rem]">
              <li>
                <a href={`tel:${theme.contact.phone.tel}`} className="group flex items-start gap-3">
                  <Phone className="mt-0.5 h-[18px] w-[18px] text-gold-500" aria-hidden="true" />
                  <span className="font-semibold text-white group-hover:text-gold-500">
                    {theme.contact.phone.display}
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${theme.contact.email}`} className="group flex items-start gap-3">
                  <Mail className="mt-0.5 h-[18px] w-[18px] text-gold-500" aria-hidden="true" />
                  <span className="group-hover:text-gold-500">{theme.contact.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-[18px] w-[18px] text-gold-500" aria-hidden="true" />
                <span>
                  {theme.contact.address.city}, {theme.contact.address.region}
                  <br />
                  {theme.contact.address.serviceArea}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-[18px] w-[18px] text-gold-500" aria-hidden="true" />
                <span>
                  {theme.contact.hours.regular.display}
                  <br />
                  <span className="text-gold-500">{theme.contact.hours.emergency.display}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/50 md:flex-row">
          <p>
            &copy; {currentYear} {theme.brand.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy/" className="hover:text-gold-500">
              Privacy Policy
            </Link>
            <span>
              {theme.contact.address.city}, {theme.contact.address.region}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
