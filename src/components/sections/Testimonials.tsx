import { theme } from "@/config/theme";
import { Reveal, SectionHeading, TestimonialCard } from "@/components/ui";

export function Testimonials() {
  if (!theme.features.testimonials) return null;

  return (
    <section className="section bg-white">
      <div className="container">
        <SectionHeading align="center" eyebrow="Customer feedback" title="What our customers say" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
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
