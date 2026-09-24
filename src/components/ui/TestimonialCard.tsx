import { Quote, Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  service: string;
  rating: number;
}

export function TestimonialCard({ quote, author, service, rating }: TestimonialCardProps) {
  return (
    <figure className="flex h-full flex-col rounded-[var(--radius-xl)] border border-line bg-white p-7">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={i < rating ? "h-4 w-4 fill-gold-500 text-gold-500" : "h-4 w-4 text-line-strong"}
              aria-hidden="true"
            />
          ))}
        </div>
        <Quote className="h-6 w-6 text-line-strong" aria-hidden="true" />
      </div>
      <blockquote className="flex-1 text-pretty leading-relaxed text-ink">&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className="mt-6 border-t border-line pt-4">
        <p className="font-semibold text-ink">{author}</p>
        <p className="text-sm text-ink-3">{service}</p>
      </figcaption>
    </figure>
  );
}

export default TestimonialCard;
