"use client";

import { theme } from "@/config/theme";
import { TestimonialCard, SectionHeading } from "@/components/ui";

export function Testimonials() {
  return (
    <section className="section bg-[var(--bg-secondary)]" id="testimonials">
      <div className="container">
        <SectionHeading
          title="What Our Customers Say"
          subtitle="Don't just take our word for it. Here's what our satisfied customers have to say about our services."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theme.testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              quote={testimonial.quote}
              author={testimonial.author}
              service={testimonial.service}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
