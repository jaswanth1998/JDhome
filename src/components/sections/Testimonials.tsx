import { theme } from "@/config/theme";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading, TestimonialCard } from "@/components/ui";

type Testimonial = {
  id: number;
  quote: string;
  author: string;
  service: string;
  serviceIds: readonly string[];
  rating: number;
};

/** Fewer matching reviews than this and the section shows the full list instead. */
const MIN_FILTERED = 3;

interface TestimonialsProps {
  /** Show only reviews tagged with one of these service ids (falls back to all when too few match). */
  serviceIds?: readonly string[];
  /** Section background, so it alternates with the section above it. */
  tone?: "white" | "cool";
}

export function Testimonials({ serviceIds, tone = "white" }: TestimonialsProps = {}) {
  if (!theme.features.testimonials) return null;

  const all: readonly Testimonial[] = theme.testimonials;
  const matching = serviceIds ? all.filter((t) => t.serviceIds.some((id) => serviceIds.includes(id))) : all;
  const testimonials = matching.length >= MIN_FILTERED ? matching : all;
  const reviews = theme.contact.googleReviews;

  return (
    <section className={cn("section", tone === "cool" ? "bg-paper-cool" : "bg-white")}>
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Google reviews"
          title="What our customers say"
          subtitle={
            <>
              Rated {reviews.rating.toFixed(1)} out of 5 from {reviews.count} Google reviews.{" "}
              <a
                href={reviews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy-800 underline underline-offset-4 hover:text-gold-700"
              >
                Read them on Google
              </a>
            </>
          }
        />
        <div
          className={cn(
            "mt-12 grid gap-6",
            testimonials.length % 3 === 0 ? "md:grid-cols-3" : "mx-auto max-w-4xl md:grid-cols-2",
          )}
        >
          {testimonials.map((t, i) => (
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
