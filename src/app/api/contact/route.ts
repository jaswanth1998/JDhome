import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the form data
    const validatedData = contactFormSchema.parse(body);

    // Log the submission
    console.log("Contact form submission:", validatedData);

    // Prepare webhook payload
    const webhookPayload = {
      type: "contact",
      timestamp: new Date().toISOString(),
      source: "jd-homes-website",
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      service: validatedData.service,
      message: validatedData.message,
      preferredContact: validatedData.preferredContact,
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        service: validatedData.service,
        message: validatedData.message,
        preferredContact: validatedData.preferredContact,
      },
    };

    // Send to webhook
    const webhookResponse = await fetch(
      "https://myn8n.plaper.org/webhook/JD-homes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
        body: JSON.stringify(webhookPayload),
      }
    );

    if (!webhookResponse.ok) {
      console.error("Webhook error:", await webhookResponse.text());
      throw new Error("Failed to send notification");
    }

    return NextResponse.json(
      { message: "Form submitted successfully", data: validatedData },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
