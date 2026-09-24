import { ClipboardList, PhoneCall, ShieldCheck } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/ui";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us what's going on",
    body: "Send a quick request online or call. A few details about the door or the property is all we need to start.",
  },
  {
    icon: PhoneCall,
    title: "We confirm and book a visit",
    body: "We call you back during business hours, talk through options, and set a time that works for you.",
  },
  {
    icon: ShieldCheck,
    title: "Done right, then tested",
    body: "We complete the work, test everything, and walk you through it before we leave.",
  },
];

export function Process() {
  return (
    <section className="section bg-paper-cool">
      <div className="container">
        <SectionHeading align="center" eyebrow="How it works" title="Simple from first call to finished job" />
        <div className="relative mt-14">
          <span
            className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-line-strong md:block"
            aria-hidden="true"
          />
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <Reveal as="li" key={title} delay={i * 0.08} className="relative text-center">
                <span className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-white text-navy-800 shadow-[var(--shadow-sm)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-900">
                    {i + 1}
                  </span>
                </span>
                <h3 className="text-lg text-ink">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-ink-2">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Process;
