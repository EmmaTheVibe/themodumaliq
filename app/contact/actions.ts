"use server";

import { EMAIL_PATTERN, LIMITS, MESSAGE_MIN, NAME_PATTERN } from "@/components/contact/rules";
import { SHOOTS } from "@/components/contact/shoots";
import { EMAIL } from "@/components/site";

export type Field = "name" | "email" | "shoot" | "message";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: Record<Field, string>;
};

const FALLBACK = `You can also email ${EMAIL} directly.`;

export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const values = {
    name: String(form.get("name") ?? "").trim().replace(/\s+/g, " "),
    email: String(form.get("email") ?? "").trim(),
    shoot: String(form.get("shoot") ?? "").trim(),
    message: String(form.get("message") ?? "").trim(),
  };

  if (String(form.get("company") ?? "")) return { status: "sent" };

  const errors: ContactState["errors"] = {};
  if (!values.name) errors.name = "Please tell me your name.";
  else if (values.name.length < 2) errors.name = "Please enter your full name.";
  else if (values.name.length > LIMITS.name) errors.name = "That name is a little long.";
  else if (!NAME_PATTERN.test(values.name)) errors.name = "Please use letters only, with spaces, hyphens or apostrophes.";
  if (!values.email) errors.email = "Please enter your email address.";
  else if (values.email.length > LIMITS.email || !EMAIL_PATTERN.test(values.email))
    errors.email = "Please enter a valid email address, like name@example.com.";
  if (!SHOOTS.includes(values.shoot)) errors.shoot = "Please choose the kind of shoot.";
  if (!values.message) errors.message = "Please write a short message.";
  else if (values.message.length < MESSAGE_MIN) errors.message = "Please tell me a little more about your shoot.";
  else if (values.message.length > LIMITS.message)
    errors.message = `Please keep it under ${LIMITS.message.toLocaleString("en")} characters.`;
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) {
    return { status: "error", message: `The contact form isn’t connected yet. ${FALLBACK}`, values };
  }

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        name: values.name,
        email: values.email,
        reply_to: values.email,
        shoot: values.shoot,
        message: values.message,
      },
    }),
  });

  if (!res.ok) {
    console.error("EmailJS send failed", res.status, await res.text());
    return { status: "error", message: `Something went wrong sending your message. Please try again. ${FALLBACK}`, values };
  }
  return { status: "sent" };
}
