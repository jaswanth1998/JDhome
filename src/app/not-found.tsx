import Link from "next/link";
import Image from "next/image";
import { Home, Phone } from "lucide-react";
import { theme } from "@/config/theme";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-cool px-4 py-16">
      <div className="max-w-lg text-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-3">
          <Image src={theme.brand.logo.mark} alt={`${theme.brand.name} logo`} width={403} height={337} className="h-10 w-auto" />
          <span className="font-[family-name:var(--font-heading)] text-lg font-extrabold text-navy-800">
            {theme.brand.name}
          </span>
        </Link>
        <p className="eyebrow mb-4 justify-center">Error 404</p>
        <h1 className="text-4xl text-ink md:text-5xl">Page not found</h1>
        <p className="mt-4 text-lg text-ink-2">
          Sorry, we couldn&apos;t find that page. It may have moved or no longer exists.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary btn-lg">
            <Home className="h-[18px] w-[18px]" aria-hidden="true" />
            Back to home
          </Link>
          <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-gold btn-lg">
            <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
            {theme.contact.phone.display}
          </a>
        </div>
      </div>
    </main>
  );
}
