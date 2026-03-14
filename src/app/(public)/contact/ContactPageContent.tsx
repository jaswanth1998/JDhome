"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { theme } from "@/config/theme";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s\-()]+$/, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  preferredContact: z.enum(["phone", "email"]),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const serviceOptions = [
  { value: "", label: "Select a service..." },
  { value: "smart-lock", label: "Smart Lock Installation" },
  { value: "emergency", label: "Emergency Lockout" },
  { value: "installation", label: "Lock Installation/Replacement" },
  { value: "high-security", label: "High-Security Systems" },
  { value: "garage-door", label: "Garage Door Services" },
  { value: "rekeying", label: "Lock Rekeying" },
  { value: "other", label: "Other" },
];

export function ContactPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      preferredContact: "phone",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare webhook payload
      const webhookPayload = {
        type: "contact",
        timestamp: new Date().toISOString(),
        source: "jd-homes-website",
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        preferredContact: data.preferredContact,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          service: data.service,
          message: data.message,
          preferredContact: data.preferredContact,
        },
      };

      // Send directly to webhook
      const response = await fetch(
        "https://myn8n.plaper.org/webhook/JD-homes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        }
      );

      if (response.ok) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-white/80"
            >
              Get in touch for a free quote or immediate assistance with your
              locksmith needs
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6">
                Send Us a Message
              </h2>

              {/* Success Message */}
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">
                      Message sent successfully!
                    </p>
                    <p className="text-sm text-green-700">
                      We&apos;ll get back to you within 2 hours during business hours.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Something went wrong
                    </p>
                    <p className="text-sm text-red-700">
                      Please try again or call us directly.
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                  >
                    Name *
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    id="name"
                    className={cn(
                      "input",
                      errors.name && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                  >
                    Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className={cn(
                      "input",
                      errors.email && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                  >
                    Phone *
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    id="phone"
                    className={cn(
                      "input",
                      errors.phone && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="(123) 456-7890"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Service */}
                <div>
                  <label
                    htmlFor="service"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                  >
                    Service Needed *
                  </label>
                  <select
                    {...register("service")}
                    id="service"
                    className={cn(
                      "input cursor-pointer",
                      errors.service && "border-red-500 focus:border-red-500"
                    )}
                  >
                    {serviceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.service.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[var(--text-primary)] mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    {...register("message")}
                    id="message"
                    rows={4}
                    className={cn(
                      "input textarea",
                      errors.message && "border-red-500 focus:border-red-500"
                    )}
                    placeholder="Tell us about your project or issue..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <span className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                    Preferred Contact Method
                  </span>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        {...register("preferredContact")}
                        type="radio"
                        value="phone"
                        className="w-4 h-4 text-[var(--accent-teal)] border-[var(--border-medium)] focus:ring-[var(--accent-teal)]"
                      />
                      <span className="text-[var(--text-secondary)]">Phone</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        {...register("preferredContact")}
                        type="radio"
                        value="email"
                        className="w-4 h-4 text-[var(--accent-teal)] border-[var(--border-medium)] focus:ring-[var(--accent-teal)]"
                      />
                      <span className="text-[var(--text-secondary)]">Email</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={Send}
                  isLoading={isSubmitting}
                  fullWidth
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              {/* Emergency Contact */}
              <div className="mb-8 p-6 rounded-xl bg-[var(--accent-orange)] bg-opacity-10 border border-[var(--accent-orange)] border-opacity-20">
                <h3 className="text-lg font-semibold text-[var(--accent-orange)] mb-2">
                  Emergency Lockout?
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  We&apos;re available 24/7 for emergency lockout services.
                </p>
                <a
                  href={`tel:${theme.contact.phone.tel}`}
                  className="inline-flex items-center gap-2 text-2xl font-bold text-[var(--accent-orange)] hover:opacity-80 transition-opacity"
                >
                  <Phone className="w-6 h-6" />
                  {theme.contact.phone.display}
                </a>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6">
                Contact Information
              </h2>

              {/* Contact Details */}
              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <Phone style={{color:"white "}} className="w-6 h-6 text-[var(--accent-teal)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      Phone
                    </h4>
                    <a
                      href={`tel:${theme.contact.phone.tel}`}
                      className="text-[var(--accent-teal)] hover:underline"
                    >
                      {theme.contact.phone.display}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <Mail style={{color:"white "}} className="w-6 h-6 text-[var(--accent-teal)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      Email
                    </h4>
                    <a
                      href={`mailto:${theme.contact.email}`}
                      className="text-[var(--accent-teal)] hover:underline"
                    >
                      {theme.contact.email}
                    </a>
                  </div>
                </div>

                {/* Service Area */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <MapPin style={{color:"white"}} className="w-6 h-6 text-[var(--accent-teal)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      Service Area
                    </h4>
                    <p className="text-[var(--text-secondary)]">
                      {theme.contact.address.serviceArea}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {theme.contact.address.fullServiceArea}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-teal)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                    <Clock style={{color:"white"}} className="w-6 h-6 text-[var(--accent-teal)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      Hours
                    </h4>
                    <p className="text-[var(--text-secondary)]">
                      Regular: {theme.contact.hours.regular.display}
                    </p>
                    <p className="text-[var(--accent-orange)] font-medium">
                      Emergency: {theme.contact.hours.emergency.display}
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="mt-8 p-6 rounded-xl bg-[var(--bg-secondary)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                  Response Time
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  {theme.contact.responseTime.regular}
                </p>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  <span className="text-[var(--accent-orange)] font-medium">
                    Emergency:
                  </span>{" "}
                  {theme.contact.responseTime.emergency}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactPageContent;
