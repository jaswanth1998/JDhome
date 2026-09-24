"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, MapPin, Menu, Phone, ShieldCheck, X } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";
import { ServiceIcon } from "@/components/ui";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  children?: { name: string; href: string; description: string; icon: string }[];
};

const primaryServices = theme.services.categories.filter((s) => s.tier === "primary");
const addonServices = theme.services.categories.filter((s) => s.tier === "addon");

const navigation: NavItem[] = [
  ...primaryServices.map((s) => ({ name: s.shortName, href: `/services/${s.id}/` })),
  {
    name: "More",
    href: "/services/",
    children: [
      ...addonServices.map((s) => ({
        name: s.name,
        href: `/services/${s.id}/`,
        description: s.shortDescription,
        icon: s.icon,
      })),
      {
        name: "All services",
        href: "/services/",
        description: "Everything we do, in one place.",
        icon: "Wrench",
      },
      {
        name: "About us",
        href: "/about/",
        description: "Who we are and how we work.",
        icon: "Info",
      },
    ],
  },
  { name: "Service Areas", href: "/service-areas/" },
  { name: "Guides", href: "/blog/" },
  { name: "Contact", href: "/contact/" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [menuPathname, setMenuPathname] = useState(pathname);

  // Close menus on route change (derived during render rather than in an effect)
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Compare without trailing slashes so it works whether or not the router reports one
  const isActive = (href: string) => {
    const current = pathname.replace(/\/+$/, "") || "/";
    const target = href.replace(/\/+$/, "") || "/";
    if (target === "/") return current === "/";
    return current === target || current.startsWith(`${target}/`);
  };

  return (
    <>
      {/* Utility bar */}
      <div className="hidden bg-navy-950 text-[0.8125rem] text-white/75 md:block">
        <div className="container flex h-9 items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
              Based in {theme.contact.address.city} · Serving Durham Region
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
              {theme.contact.hours.regular.display}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
              {theme.contact.hours.emergency.display}
            </span>
            <a href={`tel:${theme.contact.phone.tel}`} className="flex items-center gap-1.5 font-semibold text-white hover:text-gold-500">
              <Phone className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
              {theme.contact.phone.display}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-shadow duration-300",
          isScrolled ? "border-line shadow-[var(--shadow-md)]" : "border-transparent",
        )}
      >
        <div className="container">
          <nav
            className="flex h-[var(--header-height-mobile)] items-center justify-between gap-6 md:h-[var(--header-height)]"
            aria-label="Main"
          >
            <Link
              href="/"
              className="flex flex-shrink-0 items-center gap-3 xl:mr-4 min-[1440px]:mr-6"
              aria-label={`${theme.brand.name} home`}
            >
              <Image
                src={theme.brand.logo.mark}
                alt={`${theme.brand.name} logo`}
                width={403}
                height={337}
                className="h-9 w-auto md:h-10"
              />
              <span className="leading-tight">
                <span className="block whitespace-nowrap font-[family-name:var(--font-heading)] text-[1.0625rem] font-extrabold tracking-tight text-navy-800">
                  {theme.brand.name}
                </span>
                <span className="mt-0.5 hidden whitespace-nowrap text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3 sm:block xl:hidden min-[1440px]:block">
                  Garage Doors · Security Cameras
                </span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <ul className="hidden items-center xl:flex xl:gap-1 min-[1440px]:gap-2">
              {navigation.map((item) => (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                  onMouseLeave={() => item.children && setOpenDropdown(null)}
                >
                  {item.children ? (
                    <button
                      type="button"
                      aria-expanded={openDropdown === item.name}
                      onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.9375rem] xl:px-3 font-medium transition-colors",
                        item.children.some((c) => isActive(c.href))
                          ? "text-navy-800"
                          : "text-ink-2 hover:text-navy-800",
                      )}
                    >
                      {item.name}
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", openDropdown === item.name && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "relative block whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.9375rem] xl:px-3 font-medium transition-colors",
                        isActive(item.href) ? "text-navy-800" : "text-ink-2 hover:text-navy-800",
                      )}
                    >
                      {item.name}
                      {isActive(item.href) && (
                        <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-gold-500" />
                      )}
                    </Link>
                  )}

                  {item.children && (
                    <AnimatePresence>
                      {openDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-2"
                        >
                          <ul className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white p-2 shadow-[var(--shadow-lg)]">
                            {item.children.map((child) => (
                              <li key={child.href + child.name}>
                                <Link
                                  href={child.href}
                                  className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-paper-cool"
                                >
                                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-paper-cool text-navy-700">
                                    <ServiceIcon name={child.icon} className="h-[18px] w-[18px]" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-semibold text-ink">{child.name}</span>
                                    <span className="block text-xs leading-relaxed text-ink-3">
                                      {child.description}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              ))}
            </ul>

            {/* Desktop actions */}
            <div className="hidden items-center gap-4 xl:flex">
              <a
                href={`tel:${theme.contact.phone.tel}`}
                className="hidden items-center gap-2 whitespace-nowrap text-navy-800 min-[1380px]:flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-cool">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-3">
                    Call us
                  </span>
                  <span className="block font-bold">{theme.contact.phone.display}</span>
                </span>
              </a>
              <InquiryButton icon={null}>Get a free quote</InquiryButton>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-1 xl:hidden">
              <InquiryButton size="sm" icon={null} className="mr-2 hidden md:inline-flex">
                Get a free quote
              </InquiryButton>
              <a
                href={`tel:${theme.contact.phone.tel}`}
                className="rounded-lg p-2.5 text-navy-800 hover:bg-paper-cool"
                aria-label={`Call ${theme.contact.phone.display}`}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-lg p-2.5 text-navy-800 hover:bg-paper-cool"
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-navy-950/50 xl:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed bottom-0 right-0 top-0 z-[60] flex w-[86%] max-w-sm flex-col bg-white xl:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="font-[family-name:var(--font-heading)] font-extrabold text-navy-800">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-ink-2 hover:bg-paper-cool"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
                <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  Services
                </p>
                {theme.services.categories.map((s) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.id}/`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium",
                      isActive(`/services/${s.id}/`) ? "bg-paper-cool text-navy-800" : "text-ink hover:bg-paper-cool",
                    )}
                  >
                    <ServiceIcon name={s.icon} className="h-5 w-5 text-navy-700" />
                    {s.name}
                    {s.tier === "addon" && (
                      <span className="ml-auto text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">
                        Add-on
                      </span>
                    )}
                  </Link>
                ))}
                <div className="my-3 border-t border-line" />
                {[
                  { name: "Home", href: "/" },
                  { name: "Service Areas", href: "/service-areas/" },
                  { name: "Guides & advice", href: "/blog/" },
                  { name: "About", href: "/about/" },
                  { name: "Contact", href: "/contact/" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 font-medium",
                      isActive(item.href) ? "bg-paper-cool text-navy-800" : "text-ink hover:bg-paper-cool",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="space-y-3 border-t border-line p-5">
                <InquiryButton fullWidth size="lg" icon={null}>
                  Get a free quote
                </InquiryButton>
                <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-outline btn-lg w-full">
                  <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                  {theme.contact.phone.display}
                </a>
                <p className="text-center text-xs text-ink-3">{theme.contact.hours.emergency.display}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
