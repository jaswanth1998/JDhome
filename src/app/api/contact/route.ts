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

    // Log the submission (in production, you would send an email here)
    console.log("Contact form submission:", validatedData);

    // Here you would typically:
    // 1. Send an email notification using a service like SendGrid, Resend, or Nodemailer
    // 2. Store the submission in a database
    // 3. Send a confirmation email to the user

    // Example with Resend (uncomment and configure when ready):
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    //
    // await resend.emails.send({
    //   from: 'noreply@jdhomesolutions.com',
    //   to: 'info@jdhomesolutions.com',
    //   subject: `New Contact Form Submission - ${validatedData.service}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${validatedData.name}</p>
    //     <p><strong>Email:</strong> ${validatedData.email}</p>
    //     <p><strong>Phone:</strong> ${validatedData.phone}</p>
    //     <p><strong>Service:</strong> ${validatedData.service}</p>
    //     <p><strong>Preferred Contact:</strong> ${validatedData.preferredContact}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${validatedData.message}</p>
    //   `,
    // });

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
