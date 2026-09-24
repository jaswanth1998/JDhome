import { AlertTriangle, ArrowUpDown, Cog, PanelTop, Volume2, Warehouse, Zap } from "lucide-react";
import { InquiryButton } from "@/components/inquiry";
import { Photo, Reveal, SectionHeading } from "@/components/ui";

const problems = [
  {
    icon: Zap,
    title: "Broken spring or cable",
    body: "Door feels heavy or won't lift. Stop using it and let us replace the part safely.",
  },
  {
    icon: ArrowUpDown,
    title: "Won't open or close",
    body: "Stuck halfway, reverses, or doesn't respond. We trace the cause and fix it.",
  },
  {
    icon: AlertTriangle,
    title: "Off-track or crooked",
    body: "Rollers out of the track or a door hanging unevenly. Realigned and tested.",
  },
  {
    icon: Volume2,
    title: "Noisy or shaking",
    body: "Grinding, banging, or rattling usually means worn rollers, hinges, or loose hardware.",
  },
  {
    icon: Cog,
    title: "Opener or remote issues",
    body: "Opener repair, replacement, remote and keypad setup, and safety sensor checks.",
  },
  {
    icon: PanelTop,
    title: "Damaged panels or new door",
    body: "Dented or tired door? We'll tell you honestly whether to repair or replace.",
  },
];

/** Common garage door problems we fix. */
export function GarageProblems() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Garage door repair"
              title="Common problems we fix every week"
              subtitle="Garage doors carry a lot of tension. If something looks wrong, stop using the door and call us. We'll diagnose it, explain the fix, and finish with a full safety and balance check."
            />
            <Photo
              image="garageHome"
              aspect={4 / 3}
              sizes="(min-width: 1024px) 460px, 100vw"
              className="mt-8 aspect-[4/3] max-lg:hidden"
            />
            <div className="mt-8">
              <InquiryButton service="garage-repair" variant="navy">
                Book a garage door repair
              </InquiryButton>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {problems.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                as="li"
                key={title}
                delay={(i % 2) * 0.06}
                className="h-full rounded-[var(--radius-lg)] border border-line bg-paper-warm p-6 transition-colors hover:border-line-strong"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-navy-700 shadow-[var(--shadow-sm)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg text-ink">{title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{body}</p>
              </Reveal>
            ))}
            <Reveal
              as="li"
              delay={0.1}
              className="flex items-center gap-4 rounded-[var(--radius-lg)] bg-navy-800 p-6 text-white sm:col-span-2"
            >
              <Warehouse className="h-8 w-8 flex-shrink-0 text-gold-500" aria-hidden="true" />
              <p className="text-[0.9375rem] leading-relaxed text-white/85">
                <strong className="text-white">Every visit ends with a safety inspection and balance test</strong>, so
                you know the whole system is working, not just the part we fixed.
              </p>
            </Reveal>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default GarageProblems;
