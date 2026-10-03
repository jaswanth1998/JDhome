import Image from "next/image";
import { theme } from "@/config/theme";

/** Slim band of client logos under the hero. */
export function TrustStrip() {
  return (
    <section className="border-b border-line bg-white" aria-label="Businesses we work with">
      <div className="container flex flex-col items-center gap-6 py-8 md:flex-row md:justify-between">
        <p className="text-center text-sm font-medium text-ink-3 md:text-left">
          Trusted by homeowners, landlords, and local businesses, including
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {theme.partners.companies.map((company) => (
            <li key={company.id}>
              <Image
                src={company.logo}
                alt={company.name}
                width={140}
                height={40}
                className="h-8 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TrustStrip;
