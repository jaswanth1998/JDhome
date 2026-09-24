import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { coreCities } from "@/lib/seo";
import { Photo, SectionHeading } from "@/components/ui";

const otherCities: readonly ServiceCity[] = theme.serviceCities.filter((c) => !c.core);

export function ServiceArea() {
  return (
    <section className="section bg-paper-cool">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Service area"
              title="Based in Oshawa, working across Durham Region"
              subtitle="Oshawa is home base, so the core Durham communities below are the quickest for us to reach. We also travel farther afield; just ask."
            />
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {coreCities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/service-areas/${city.slug}/`}
                    className="group flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-3 font-medium text-ink transition-colors hover:border-navy-600"
                  >
                    <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-ink-3">
              Also serving {otherCities.map((c) => c.name).join(", ")}.{" "}
              <Link href="/service-areas/" className="inline-flex items-center gap-0.5 font-semibold text-navy-700">
                All areas
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </p>
          </div>
          <Photo image="garageDark" aspect={4 / 3} sizes="(min-width: 1024px) 560px, 100vw" className="aspect-[4/3]" />
        </div>
      </div>
    </section>
  );
}

export default ServiceArea;
