"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Services",
    href: "/services",
    dropdown: [
      { name: "Smart Lock Installation", href: "/services#smart-locks" },
      { name: "Emergency Lockout", href: "/services#emergency" },
      { name: "Lock Installation", href: "/services#installation" },
      { name: "High-Security Systems", href: "/services#high-security" },
      { name: "Garage Door Services", href: "/services#garage-door" },
      { name: "Lock Rekeying", href: "/services#rekeying" },
    ],
  },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-md"
            : "bg-white"
        )}
      >
        <div className="container">
          <nav className="flex items-center justify-between h-[var(--header-height-mobile)] md:h-[var(--header-height)]">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-[var(--primary-main)]"
            >
              <div className="w-10 h-10 bg-[var(--primary-main)] rounded-lg flex items-center justify-center text-white font-bold">
                JD
              </div>
              <span className="hidden sm:inline">{theme.brand.name}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                      isActive(item.href)
                        ? "text-[var(--accent-teal)]"
                        : "text-[var(--text-primary)] hover:text-[var(--accent-teal)] hover:bg-[var(--neutral-light-gray)]"
                    )}
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-[var(--border-light)] py-2 overflow-hidden"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] hover:text-[var(--accent-teal)] transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                as="a"
                href={`tel:${theme.contact.phone.tel}`}
                variant="emergency"
                icon={Phone}
                size="md"
              >
                {theme.contact.phone.display}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)] transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)]"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-[var(--neutral-light-gray)] text-[var(--accent-teal)]"
                            : "text-[var(--text-primary)] hover:bg-[var(--neutral-light-gray)]"
                        )}
                      >
                        {item.name}
                      </Link>

                      {/* Mobile Dropdown Items */}
                      {item.dropdown && (
                        <div className="pl-4 mt-1 space-y-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <div className="mt-8 space-y-3">
                  <Button
                    as="a"
                    href={`tel:${theme.contact.phone.tel}`}
                    variant="emergency"
                    icon={Phone}
                    fullWidth
                    size="lg"
                  >
                    Call Now: {theme.contact.phone.display}
                  </Button>

                  <Button
                    as="link"
                    href="/contact"
                    variant="primary"
                    fullWidth
                    size="lg"
                  >
                    Get a Free Quote
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-[var(--border-light)]">
                  <p className="text-sm text-[var(--text-muted)] mb-2">
                    Emergency Services Available
                  </p>
                  <p className="text-lg font-semibold text-[var(--accent-orange)]">
                    24/7 For Lockouts
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-[var(--header-height-mobile)] md:h-[var(--header-height)]" />
    </>
  );
}

export default Header;
