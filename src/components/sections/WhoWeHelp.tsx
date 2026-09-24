import { theme } from "@/config/theme";
import { SectionHeading, ServiceIcon } from "@/components/ui";

export function WhoWeHelp() {
  return (
    <section className="section bg-paper-warm">
      <div className="container">
        <SectionHeading eyebrow="Who we help" title="Homes, rentals, and local businesses" />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {theme.clients.segments.map((segment) => (
            <li key={segment.id} className="rounded-[var(--radius-lg)] border border-line bg-white p-6">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
                <ServiceIcon name={segment.icon} className="h-5 w-5" />
              </span>
              <h3 className="text-lg text-ink">{segment.name}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{segment.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WhoWeHelp;
