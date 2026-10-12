"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Car,
  Cctv,
  CheckCircle2,
  KeyRound,
  Lock,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Star,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { theme } from "@/config/theme";
import { trackMetaEvent } from "@/components/analytics";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getAttribution, toE164 } from "@/lib/tracking/attribution";
import { INQUIRY_SERVICES, inquirySchema, type InquiryFormValues, type InquiryService } from "@/lib/inquiries/schema";

/** Short Google review shown under the send button (theme.testimonials id). */
const FORM_REVIEW_ID = 5;

const serviceIcons: Record<InquiryService, LucideIcon> = {
  "garage-repair": Wrench,
  "garage-install": Warehouse,
  "security-cameras": Cctv,
  locksmith: KeyRound,
  "car-lockout": Car,
  other: MessageSquare,
};

interface InquiryFormProps {
  defaultService?: InquiryService;
  /** Called after a successful submission (e.g. to show a close button). */
  onClose?: () => void;
  className?: string;
}

type SubmitState = { status: "idle" } | { status: "error"; message: string } | { status: "done"; name: string };

/** Loads the Firebase SDK and submit logic (code-split so it isn't in the initial page bundle). */
const loadSubmitModules = () => Promise.all([import("@/lib/firebase/client"), import("@/lib/inquiries/submit")]);

/** Give up after this long so a dropped connection doesn't leave the overlay up forever. */
const SUBMIT_TIMEOUT_MS = 20_000;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function InquiryForm({ defaultService, onClose, className }: InquiryFormProps) {
  const pathname = usePathname();
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const [showNote, setShowNote] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  const started = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    mode: "onTouched",
    defaultValues: {
      service: defaultService,
      name: "",
      phone: "",
      email: "",
      textMe: false,
      message: "",
      company: "",
    },
  });

  const service = useWatch({ control, name: "service" });
  const phoneValue = useWatch({ control, name: "phone" }) ?? "";

  // Move focus to the confirmation heading once sent (not on first render).
  useEffect(() => {
    if (hasNavigated.current) headingRef.current?.focus();
  }, [submit.status]);

  /**
   * First touch of the form: report it (so GTM can compare starts with sends) and start
   * downloading the Firebase code so pressing "Send" doesn't wait for it.
   */
  const onStart = () => {
    if (started.current) return;
    started.current = true;
    window.dataLayer?.push({ event: "inquiry_started", inquiry_service: service ?? "" });
    loadSubmitModules().catch(() => undefined);
  };

  const onSubmit = async (values: InquiryFormValues) => {
    // Honeypot filled: pretend success, store nothing.
    if (values.company) {
      hasNavigated.current = true;
      setSubmit({ status: "done", name: values.name });
      return;
    }

    setSubmit({ status: "idle" });
    try {
      const [{ isFirebaseConfigured }, { submitInquiry }] = await loadSubmitModules();
      if (!isFirebaseConfigured()) {
        throw new Error("Online requests are not set up yet.");
      }
      let timer: ReturnType<typeof setTimeout> | undefined;
      const inquiryId = await Promise.race([
        submitInquiry(values, pathname ?? "/", getAttribution()),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Timed out saving the inquiry")), SUBMIT_TIMEOUT_MS);
        }),
      ]).finally(() => clearTimeout(timer));
      // transaction_id stops Google Ads counting the same lead twice; user_data feeds
      // Enhanced Conversions (GTM hashes it before it is sent to Google).
      const [firstName, ...rest] = values.name.trim().split(/\s+/);
      window.dataLayer?.push({
        event: "inquiry_submitted",
        inquiry_service: values.service,
        transaction_id: inquiryId,
        user_data: {
          ...(values.email ? { email: values.email.trim().toLowerCase() } : {}),
          ...(toE164(values.phone) ? { phone_number: toE164(values.phone) } : {}),
          address: { first_name: firstName, ...(rest.length ? { last_name: rest.join(" ") } : {}), country: "CA" },
        },
      });
      trackMetaEvent("Lead", { content_name: values.service });
      hasNavigated.current = true;
      setSubmit({ status: "done", name: values.name.split(" ")[0] });
    } catch (error) {
      console.error("Inquiry submission failed", error);
      setSubmit({
        status: "error",
        message:
          "We couldn't send your request just now. Please try again, or call us and we'll take the details over the phone.",
      });
    }
  };

  if (submit.status === "done") {
    return (
      <div className={cn("flex flex-col items-center px-2 py-8 text-center", className)}>
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F5EF]">
          <CheckCircle2 className="h-8 w-8 text-[var(--success)]" aria-hidden="true" />
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl text-ink outline-none">
          Thanks{submit.name ? `, ${submit.name}` : ""}. Your request is in.
        </h2>
        <p className="mt-3 max-w-md text-ink-2">
          We&apos;ll get back to you during business hours ({theme.contact.hours.regular.display}) to talk through the
          job and your free quote. If it can&apos;t wait, give us a call.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button as="a" href={`tel:${theme.contact.phone.tel}`} variant="navy" icon={Phone}>
            {theme.contact.phone.display}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  const reviews = theme.contact.googleReviews;
  const review = theme.testimonials.find((t) => t.id === FORM_REVIEW_ID);

  return (
    <form onSubmit={handleSubmit(onSubmit)} onFocusCapture={onStart} noValidate className={className}>
      <h2 ref={headingRef} tabIndex={-1} className="mb-4 text-2xl text-ink outline-none">
        What do you need?
      </h2>

      <fieldset>
        <legend className="sr-only">Service needed</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INQUIRY_SERVICES.map((option) => {
            const Icon = serviceIcons[option.value];
            const selected = service === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("service", option.value, { shouldValidate: true })}
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--radius-lg)] border px-3 py-3 text-left text-sm font-semibold transition-all",
                  selected
                    ? "border-navy-800 bg-paper-cool text-ink ring-1 ring-navy-800"
                    : "border-line bg-white text-ink hover:border-navy-600",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md",
                    selected ? "bg-navy-800 text-gold-500" : "bg-paper-cool text-navy-700",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
        {errors.service && <FieldError message={errors.service.message} />}
      </fieldset>

      {service === "car-lockout" && (
        <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-3.5">
          <Car className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-700" aria-hidden="true" />
          <p className="text-sm text-ink">
            <strong>Locked out right now?</strong> Calling is fastest. Our lockout line is answered 24/7:{" "}
            <a href={`tel:${theme.contact.phone.tel}`} className="font-semibold text-navy-700 underline">
              {theme.contact.phone.display}
            </a>
          </p>
        </div>
      )}

      <div className="mt-5">
        <Field label="Your name" htmlFor="inq-name" error={errors.name?.message}>
          <input
            id="inq-name"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="Jane Smith"
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
        </Field>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-semibold text-ink">
          How can we reach you?{" "}
          <span className="font-normal text-ink-3">Phone or email, whichever you prefer.</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="inq-phone" className="sr-only">
              Phone number
            </label>
            <input
              id="inq-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className="input"
              placeholder="Phone (905) 555-0123"
              aria-invalid={errors.phone ? true : undefined}
              {...register("phone")}
            />
          </div>
          <div>
            <label htmlFor="inq-email" className="sr-only">
              Email
            </label>
            <input
              id="inq-email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="Email you@example.com"
              aria-invalid={errors.email ? true : undefined}
              {...register("email", {
                // Typing an email can satisfy the "phone or email" rule shown under phone.
                onChange: () => {
                  if (errors.phone) void trigger("phone");
                },
              })}
            />
          </div>
        </div>
        {(errors.phone || errors.email) && <FieldError message={errors.phone?.message ?? errors.email?.message} />}
      </fieldset>

      {phoneValue.trim() !== "" && (
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
          <input type="checkbox" className="h-4 w-4 accent-[var(--navy-800)]" {...register("textMe")} />
          Text me instead of calling
        </label>
      )}

      {showNote ? (
        <div className="mt-4">
          <Field label="Anything we should know?" optional htmlFor="inq-message" error={errors.message?.message}>
            <textarea
              id="inq-message"
              rows={2}
              className="input textarea"
              placeholder="e.g. The door stopped halfway and made a loud bang."
              autoFocus
              {...register("message")}
            />
          </Field>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNote(true)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a note (optional)
        </button>
      )}

      {/* Honeypot: hidden from people and assistive tech */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="inq-company">Company</label>
        <input id="inq-company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {submit.status === "error" && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[#FDF0EF] p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--danger)]" aria-hidden="true" />
          <p className="text-sm text-ink">
            {submit.message}{" "}
            <a href={`tel:${theme.contact.phone.tel}`} className="font-semibold text-navy-700 underline">
              {theme.contact.phone.display}
            </a>
          </p>
        </div>
      )}

      <Button
        type="submit"
        variant="gold"
        size="lg"
        fullWidth
        icon={isSubmitting ? Send : ArrowRight}
        iconPosition="right"
        isLoading={isSubmitting}
        className="mt-5"
      >
        {isSubmitting ? "Sending…" : "Get my free quote"}
      </Button>

      {/* Reassurance right where the decision happens */}
      <ul className="mt-4 space-y-1.5 text-sm text-ink-2">
        <li className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" aria-hidden="true" />
          We get back to you during business hours ({theme.contact.hours.regular.display}).
        </li>
        <li className="flex items-start gap-2">
          <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" aria-hidden="true" />
          Free and no obligation. We never share your details or send spam.
        </li>
      </ul>

      {review && (
        <figure className="mt-4 rounded-[var(--radius-lg)] border border-line bg-paper-cool px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <span className="flex text-gold-500" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <a href={reviews.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {reviews.rating.toFixed(1)} on Google
            </a>
          </div>
          <blockquote className="mt-1.5 text-sm text-ink-2">&ldquo;{review.quote}&rdquo;</blockquote>
          <figcaption className="mt-1 text-xs text-ink-3">{review.author}, Google review</figcaption>
        </figure>
      )}

      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        We only use your details to reply to this request. See our{" "}
        <Link href="/privacy-policy/" className="underline hover:text-ink" target="_blank">
          privacy policy
        </Link>
        .
      </p>
      <SubmittingOverlay show={isSubmitting} />
    </form>
  );
}

/**
 * Full-screen "sending" state. Portaled to <body> so it covers the whole page even
 * when the form sits inside the (transformed) quote dialog.
 */
function SubmittingOverlay({ show }: { show: boolean }) {
  // true in the browser, false during server rendering (no `document` there).
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="submitting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-navy-950/75 px-6 backdrop-blur-sm"
          role="status"
          aria-live="assertive"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-[var(--radius-xl)] bg-white px-8 py-10 text-center shadow-[var(--shadow-xl)]"
          >
            <div className="relative mx-auto mb-6 h-16 w-16" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border-4 border-line" />
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-gold-500 border-r-gold-500" />
              <Send className="absolute inset-0 m-auto h-6 w-6 text-navy-800" />
            </div>
            <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-ink">Sending your request…</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              This only takes a few seconds. Please keep this page open.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Field({
  label,
  htmlFor,
  error,
  optional = false,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-ink-3">Optional</span>}
      </label>
      {children}
      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-sm text-[var(--danger)]">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}

export default InquiryForm;
