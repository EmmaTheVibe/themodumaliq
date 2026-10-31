"use server";

export type Field = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: Record<Field, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK = "Please reach out on Instagram for now: @themodumaliq.";

export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const values = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    message: String(form.get("message") ?? "").trim(),
  };

  if (String(form.get("company") ?? "")) return { status: "sent" };

  const errors: ContactState["errors"] = {};
  if (!values.name) errors.name = "Please tell me your name.";
  else if (values.name.length > 120) errors.name = "That name is a little long.";
  if (!EMAIL.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!values.message) errors.message = "Please write a short message.";
  else if (values.message.length > 5000) errors.message = "Please keep it under 5,000 characters.";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  if (!key || !to) {
    return { status: "error", message: `The contact form isn’t connected yet. ${FALLBACK}`, values };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "themodumaliq website <onboarding@resend.dev>",
      to: [to],
      reply_to: values.email,
      subject: `New enquiry from ${values.name}`,
      text: `${values.message}\n\n${values.name} <${values.email}>`,
    }),
  });

  if (!res.ok) {
    return { status: "error", message: `Something went wrong sending your message. Please try again. ${FALLBACK}`, values };
  }
  return { status: "sent" };
}
