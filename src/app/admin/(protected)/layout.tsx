"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
];

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      const params = user && !isAdmin ? "?error=unauthorized" : "";
      router.replace(`/admin/login${params}`);
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-light-gray)]">
        <Loader2 className="w-8 h-8 text-[var(--accent-teal)] animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--neutral-light-gray)]">
      {/* Top Bar */}
      <header className="bg-white border-b border-[var(--border-light)] h-14 md:h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[var(--accent-teal)] flex items-center justify-center">
            <span className="text-xs md:text-sm font-bold text-white">JD</span>
          </div>
          <span className="font-semibold text-sm md:text-base text-[var(--text-primary)]">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-xs md:text-sm text-[var(--text-muted)] hidden sm:inline truncate max-w-[150px]">
            {profile?.username || profile?.email}
          </span>
          <LogoutButton />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - desktop only */}
        <aside className="w-64 bg-white border-r border-[var(--border-light)] min-h-[calc(100vh-4rem)] p-4 hidden md:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--accent-teal)] bg-opacity-10 text-[var(--accent-teal)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--neutral-light-gray)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)] z-30 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "text-[var(--accent-teal)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
