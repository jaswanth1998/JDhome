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
  ArrowLeft,
  ArrowRight,
  Car,
  Cctv,
  CheckCircle2,
  KeyRound,
  Lock,
  MessageSquare,
  Phone,
  Send,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CAMERA_COUNTS,
  CAMERA_FEATURES,
  CITY_OPTIONS,
  CONTACT_METHODS,
  GARAGE_ISSUES,
  INQUIRY_SERVICES,
  INQUIRY_STEPS,
  PROPERTY_TYPES,
  TIMINGS,
  inquirySchema,
  serviceGroup,
  type InquiryFormValues,
  type InquiryService,
} from "@/lib/inquiries/schema";
import { ChoiceChip } from "./ChoiceChip";

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
  const [step, setStep] = useState(defaultService ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    mode: "onTouched",
    defaultValues: {
      service: defaultService,
      cameraFeatures: [],
      city: "",
      timing: "",
      message: "",
      name: "",
      phone: "",
      email: "",
      preferredContact: "phone",
      company: "",
    },
  });

  const service = useWatch({ control, name: "service" });
  const preferredContact = useWatch({ control, name: "preferredContact" });
  const group = serviceGroup(service);

  // Move focus to the step heading after navigating (not on first render).
  useEffect(() => {
    if (hasNavigated.current) headingRef.current?.focus();
  }, [step, submit.status]);

  // Start downloading the Firebase code once the visitor reaches the last step,
  // so pressing "Send" doesn't wait for it.
  useEffect(() => {
    if (step === INQUIRY_STEPS.length - 1) loadSubmitModules().catch(() => undefined);
  }, [step]);

  const goTo = (next: number) => {
    hasNavigated.current = true;
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const next = async () => {
    const valid = await trigger([...INQUIRY_STEPS[step].fields]);
    if (valid) goTo(step + 1);
  };

  const chooseService = (value: InquiryService) => {
    setValue("service", value, { shouldValidate: true });
    goTo(1);
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
      await Promise.race([
        submitInquiry(values, pathname ?? "/"),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Timed out saving the inquiry")), SUBMIT_TIMEOUT_MS);
        }),
      ]).finally(() => clearTimeout(timer));
      window.dataLayer?.push({ event: "inquiry_submitted", inquiry_service: values.service });
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
          We&apos;ll review the details and get back to you during business hours ({theme.contact.hours.regular.display}
          ). If it can&apos;t wait, give us a call.
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

  const currentStep = INQUIRY_STEPS[step];
  const isLastStep = step === INQUIRY_STEPS.length - 1;

  // Pressing Enter on an earlier step moves forward instead of submitting.
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!isLastStep) {
      event.preventDefault();
      if (step > 0) void next();
      return;
    }
    void handleSubmit(onSubmit)(event);
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className={className}>
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">
          <span>
            Step {step + 1} of {INQUIRY_STEPS.length}
          </span>
          <span className="flex items-center gap-1.5 normal-case tracking-normal">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Free, no-obligation quote
          </span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {INQUIRY_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-gold-500" : "bg-line")}
            />
          ))}
        </div>
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mb-5 text-2xl text-ink outline-none">
        {currentStep.title}
      </h2>

      {/* Keyed so each step mounts fresh and slides in; no exit animation to wait on. */}
      <motion.div
        key={currentStep.id}
        initial={hasNavigated.current ? { opacity: 0, x: direction * 24 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* STEP 1: service */}
        {currentStep.id === "service" && (
          <fieldset>
            <legend className="sr-only">Service needed</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {INQUIRY_SERVICES.map((option) => {
                const Icon = serviceIcons[option.value];
                const selected = service === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => chooseService(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      "group flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all",
                      selected
                        ? "border-navy-800 bg-paper-cool ring-1 ring-navy-800"
                        : "border-line bg-white hover:border-navy-600 hover:shadow-[var(--shadow-md)]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                        option.group === "other" ? "bg-paper-cool text-navy-700" : "bg-navy-800 text-gold-500",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{option.label}</span>
                      <span className="mt-0.5 block text-sm text-ink-3">{option.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.service && <FieldError message={errors.service.message} />}
          </fieldset>
        )}

        {/* STEP 2: details */}
        {currentStep.id === "details" && (
          <div className="space-y-6">
            {service === "car-lockout" && (
              <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-4">
                <Car className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-700" aria-hidden="true" />
                <p className="text-sm text-ink">
                  <strong>Locked out right now?</strong> Calling is fastest. Our lockout line is answered 24/7:{" "}
                  <a href={`tel:${theme.contact.phone.tel}`} className="font-semibold text-navy-700 underline">
                    {theme.contact.phone.display}
                  </a>
                </p>
              </div>
            )}

            {group === "garage" && (
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-ink">What&apos;s going on with the door?</legend>
                <div className="flex flex-wrap gap-2">
                  {(service === "garage-install"
                    ? ["Replace my existing door", "New door (no door now)", "New door + opener", "Not sure"]
                    : GARAGE_ISSUES
                  ).map((issue) => (
                    <ChoiceChip key={issue} value={issue} label={issue} {...register("garageIssue")} />
                  ))}
                </div>
              </fieldset>
            )}

            {group === "cameras" && (
              <>
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-ink">Where are the cameras going?</legend>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <ChoiceChip key={type} value={type} label={type} {...register("propertyType")} />
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-ink">Roughly how many cameras?</legend>
                  <div className="flex flex-wrap gap-2">
                    {CAMERA_COUNTS.map((count) => (
                      <ChoiceChip key={count} value={count} label={count} {...register("cameraCount")} />
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-1 text-sm font-semibold text-ink">Features you&apos;re interested in</legend>
                  <p className="mb-3 text-sm text-ink-3">Pick any that apply. We&apos;ll explain the options.</p>
                  <div className="flex flex-wrap gap-2">
                    {CAMERA_FEATURES.map((feature) => (
                      <ChoiceChip
                        key={feature}
                        type="checkbox"
                        value={feature}
                        label={feature}
                        {...register("cameraFeatures")}
                      />
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your city" htmlFor="inq-city" error={errors.city?.message}>
                <select
                  id="inq-city"
                  className="input cursor-pointer"
                  aria-invalid={errors.city ? true : undefined}
                  {...register("city")}
                >
                  <option value="">Select a city…</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="When do you need it?" htmlFor="inq-timing" error={errors.timing?.message}>
                <select
                  id="inq-timing"
                  className="input cursor-pointer"
                  aria-invalid={errors.timing ? true : undefined}
                  {...register("timing")}
                >
                  <option value="">Select a timeframe…</option>
                  {TIMINGS.map((timing) => (
                    <option key={timing} value={timing}>
                      {timing}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Anything else we should know?" optional htmlFor="inq-message" error={errors.message?.message}>
              <textarea
                id="inq-message"
                rows={3}
                className="input textarea"
                placeholder={
                  group === "cameras"
                    ? "e.g. We want to cover the driveway, front door, and backyard."
                    : group === "garage"
                      ? "e.g. Double door, it stopped halfway and makes a loud bang."
                      : "Tell us a little about the job."
                }
                {...register("message")}
              />
            </Field>
          </div>
        )}

        {/* STEP 3: contact */}
        {currentStep.id === "contact" && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="inq-name" error={errors.name?.message}>
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
              <Field label="Phone" htmlFor="inq-phone" error={errors.phone?.message}>
                <input
                  id="inq-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  className="input"
                  placeholder="(905) 555-0123"
                  aria-invalid={errors.phone ? true : undefined}
                  {...register("phone")}
                />
              </Field>
            </div>
            <Field
              label="Email"
              optional={preferredContact !== "email"}
              htmlFor="inq-email"
              error={errors.email?.message}
            >
              <input
                id="inq-email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                aria-invalid={errors.email ? true : undefined}
                {...register("email")}
              />
            </Field>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-ink">Best way to reach you</legend>
              <div className="flex flex-wrap gap-2">
                {CONTACT_METHODS.map((method) => (
                  <ChoiceChip
                    key={method.value}
                    value={method.value}
                    label={method.label}
                    {...register("preferredContact")}
                  />
                ))}
              </div>
            </fieldset>

            {/* Honeypot: hidden from people and assistive tech */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="inq-company">Company</label>
              <input id="inq-company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
            </div>

            <p className="text-xs leading-relaxed text-ink-3">
              We only use your details to respond to this request. See our{" "}
              <Link href="/privacy-policy/" className="underline hover:text-ink" target="_blank">
                privacy policy
              </Link>
              .
            </p>
          </div>
        )}
      </motion.div>

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

      {/* Navigation */}
      {step > 0 && (
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
          {!isLastStep ? (
            // Distinct keys so React never reuses the "Continue" button as the submit button mid-click.
            <Button key="next" type="button" variant="navy" icon={ArrowRight} iconPosition="right" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button key="submit" type="submit" variant="gold" icon={Send} iconPosition="right" isLoading={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send my request"}
            </Button>
          )}
        </div>
      )}
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
