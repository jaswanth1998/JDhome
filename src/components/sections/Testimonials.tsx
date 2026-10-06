import { theme } from "@/config/theme";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading, TestimonialCard } from "@/components/ui";

export function Testimonials() {
  if (!theme.features.testimonials) return null;

  return (
    <section className="section bg-white">
      <div className="container">
        <SectionHeading align="center" eyebrow="Customer feedback" title="What our customers say" />
        <div
          className={cn(
            "mt-12 grid gap-6",
            theme.testimonials.length >= 3 ? "md:grid-cols-3" : "mx-auto max-w-4xl md:grid-cols-2",
          )}
        >
          {theme.testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.06}>
              <TestimonialCard quote={t.quote} author={t.author} service={t.service} rating={t.rating} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
