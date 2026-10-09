"use client";

import { useEffect, useState, type FocusEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, MapPin, Menu, Phone, ShieldCheck, X } from "lucide-react";
import { theme } from "@/config/theme";
import { HUB_SLUG } from "@/content/garageServices";
import { InquiryButton } from "@/components/inquiry";
import { ServiceIcon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useShowLockoutLine } from "./LockoutLine";

type NavChild = { name: string; href: string; description: string; icon: string };

type NavDropdown = {
  /** id of the always-rendered sub-list, referenced by the toggle's aria-controls. */
  id: string;
  /** Accessible name for a chevron-only toggle (used when the parent label is itself a link). */
  toggleLabel?: string;
  children: readonly NavChild[];
};

type NavItem = {
  name: string;
  href: string;
  /** When true the parent label is a real link and a separate chevron button toggles the sub-list. */
  linked?: boolean;
  dropdown?: NavDropdown;
};

const garageLinks = theme.services.garageLinks;
const primaryServices = theme.services.categories.filter((s) => s.tier === "primary");
const addonServices = theme.services.categories.filter((s) => s.tier === "addon");

const navigation: NavItem[] = [
  ...primaryServices.map((s): NavItem =>
    s.id === HUB_SLUG
      ? {
          name: s.shortName,
          href: `/services/${s.id}/`,
          linked: true,
          dropdown: { id: "nav-sub-garage", toggleLabel: "Show garage door services", children: garageLinks },
        }
      : { name: s.shortName, href: `/services/${s.id}/` },
  ),
  {
    name: "More",
    href: "/services/",
    dropdown: {
      id: "nav-sub-more",
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
  },
  { name: "Service Areas", href: "/service-areas/" },
  { name: "Guides", href: "/blog/" },
  { name: "Contact", href: "/contact/" },
];

/** Strip trailing slashes so paths compare the same whether or not the router reports one. */
const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

export function Header() {
  const pathname = usePathname();
  const showLockoutLine = useShowLockoutLine();
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

  // Close an open dropdown when a pointer (mouse, touch or pen) goes down outside every dropdown <li>.
  useEffect(() => {
    if (!openDropdown) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest("[data-nav-dropdown]")) setOpenDropdown(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openDropdown]);

  // Compare without trailing slashes so it works whether or not the router reports one
  const isActive = (href: string) => {
    const current = normalizePath(pathname);
    const target = normalizePath(href);
    if (target === "/") return current === "/";
    return current === target || current.startsWith(`${target}/`);
  };
  /** Exact page match, for dropdown entries such as "/services/" that prefix other pages. */
  const isCurrent = (href: string) => normalizePath(pathname) === normalizePath(href);
  /** A nav item is highlighted when its own page or any page in its dropdown is open. */
  const isSectionActive = (item: NavItem) =>
    (item.linked && isActive(item.href)) || (item.dropdown?.children.some((c) => isCurrent(c.href)) ?? false);

  const closeDropdown = (id: string) => setOpenDropdown((current) => (current === id ? null : current));

  // Close when focus leaves the whole <li> (toggle, parent link and sub-list).
  const handleDropdownBlur = (id: string) => (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeDropdown(id);
  };

  // Escape closes the open sub-list and returns focus to its toggle.
  const handleDropdownKeyDown = (id: string) => (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key !== "Escape" || openDropdown !== id) return;
    event.stopPropagation();
    setOpenDropdown(null);
    event.currentTarget.querySelector<HTMLButtonElement>(`button[aria-controls="${id}"]`)?.focus();
  };

  return (
    <>
      {/* Utility bar */}
      <div className="hidden bg-navy-950 text-[0.8125rem] text-white/75 md:block">
        <div className="container flex h-9 items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
              Serving {theme.contact.address.serviceArea}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
              {theme.contact.hours.regular.display}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {showLockoutLine && (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
                {theme.contact.hours.emergency.display}
              </span>
            )}
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

            {/* Desktop navigation. Sub-lists stay in the DOM (crawlable links) and are shown with visibility + a CSS transition. */}
            <ul className="hidden items-center xl:flex xl:gap-1 min-[1440px]:gap-2">
              {navigation.map((item) => {
                const dropdown = item.dropdown;
                const sectionActive = dropdown ? isSectionActive(item) : isActive(item.href);
                const isOpen = dropdown ? openDropdown === dropdown.id : false;
                const toggle = dropdown
                  ? () => setOpenDropdown(isOpen ? null : dropdown.id)
                  : undefined;

                return (
                  <li
                    key={item.name}
                    className="relative"
                    data-nav-dropdown={dropdown ? "" : undefined}
                    onMouseEnter={dropdown ? () => setOpenDropdown(dropdown.id) : undefined}
                    onMouseLeave={dropdown ? () => closeDropdown(dropdown.id) : undefined}
                    onBlur={dropdown ? handleDropdownBlur(dropdown.id) : undefined}
                    onKeyDown={dropdown ? handleDropdownKeyDown(dropdown.id) : undefined}
                  >
                    {dropdown && !item.linked ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={dropdown.id}
                        onClick={toggle}
                        className={cn(
                          "flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.9375rem] xl:px-3 font-medium transition-colors",
                          sectionActive ? "text-navy-800" : "text-ink-2 hover:text-navy-800",
                        )}
                      >
                        {item.name}
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          aria-current={isCurrent(item.href) ? "page" : undefined}
                          className={cn(
                            "relative block whitespace-nowrap rounded-lg py-2 pl-2.5 text-[0.9375rem] xl:pl-3 font-medium transition-colors",
                            dropdown ? "pr-1" : "pr-2.5 xl:pr-3",
                            sectionActive ? "text-navy-800" : "text-ink-2 hover:text-navy-800",
                          )}
                        >
                          {item.name}
                          {sectionActive && (
                            <span
                              className={cn(
                                "absolute -bottom-[1px] h-0.5 rounded-full bg-gold-500",
                                dropdown ? "left-3 right-1" : "inset-x-3",
                              )}
                            />
                          )}
                        </Link>
                        {dropdown && (
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={dropdown.id}
                            aria-label={dropdown.toggleLabel}
                            onClick={toggle}
                            className={cn(
                              "rounded-md p-1 transition-colors",
                              sectionActive ? "text-navy-800" : "text-ink-2 hover:text-navy-800",
                            )}
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>
                    )}

                    {dropdown && (
                      <div
                        className={cn(
                          "absolute left-1/2 top-full w-80 -translate-x-1/2 pt-2 transition-[opacity,translate,visibility] duration-150",
                          isOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1.5 opacity-0",
                        )}
                      >
                        <ul
                          id={dropdown.id}
                          className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white p-2 shadow-[var(--shadow-lg)]"
                        >
                          {dropdown.children.map((child) => (
                            <li key={child.href + child.name}>
                              <Link
                                href={child.href}
                                aria-current={isCurrent(child.href) ? "page" : undefined}
                                className={cn(
                                  "flex gap-3 rounded-lg p-3 transition-colors hover:bg-paper-cool",
                                  isCurrent(child.href) && "bg-paper-cool",
                                )}
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
                      </div>
                    )}
                  </li>
                );
              })}
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
              <InquiryButton icon={null} attention="shine">
                Get a free quote
              </InquiryButton>
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
                  <div key={s.id}>
                    <Link
                      href={`/services/${s.id}/`}
                      aria-current={isCurrent(`/services/${s.id}/`) ? "page" : undefined}
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
                    {s.id === HUB_SLUG && (
                      <ul className="mb-1 ml-[1.375rem] border-l border-line pl-4">
                        {garageLinks.slice(1).map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={isCurrent(link.href) ? "page" : undefined}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-[0.9375rem]",
                                isCurrent(link.href)
                                  ? "bg-paper-cool font-medium text-navy-800"
                                  : "text-ink-2 hover:bg-paper-cool",
                              )}
                            >
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
                {showLockoutLine && (
                  <p className="text-center text-xs text-ink-3">{theme.contact.hours.emergency.display}</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
