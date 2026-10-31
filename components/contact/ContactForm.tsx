"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState, type Field } from "@/app/contact/actions";
import { SHOOTS } from "./shoots";

const initial: ContactState = { status: "idle" };

const fields: { name: Field; label: string; type?: string; autoComplete?: string }[] = [
  { name: "name", label: "Name", autoComplete: "name" },
  { name: "email", label: "Email address", type: "email", autoComplete: "email" },
  { name: "shoot", label: "Kind of shoot" },
  { name: "message", label: "Message" },
];

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);

  if (state.status === "sent") {
    return (
      <div role="status" className="mt-12 border-t border-foreground/15 pt-10">
        <p className="font-display text-[clamp(28px,3vw,40px)] leading-tight font-light">
          Thank you, your message is on its way.
        </p>
        <p className="mt-4 text-[15px] leading-[1.8] font-light opacity-80">I’ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="mt-12 space-y-9">
      {fields.map((f) => {
        const error = state.errors?.[f.name];
        const id = `contact-${f.name}`;
        const shared = {
          id,
          name: f.name,
          required: true,
          defaultValue: state.values?.[f.name],
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${id}-error` : undefined,
          className:
            "mt-3 block w-full border-0 border-b border-foreground/30 bg-transparent px-0 py-2.5 text-[16px] font-light outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground aria-invalid:border-[#d97a7a]",
        };
        return (
          <div key={f.name}>
            <label htmlFor={id} className="text-[11px] tracking-[0.3em] uppercase opacity-80">
              {f.label} <span aria-hidden>*</span>
            </label>
            {f.name === "message" ? (
              <textarea {...shared} rows={5} className={`${shared.className} resize-y`} />
            ) : f.name === "shoot" ? (
              <div className="relative">
                <select
                  {...shared}
                  defaultValue={state.values?.shoot ?? ""}
                  className={`${shared.className} cursor-pointer appearance-none pr-8 invalid:text-foreground/40`}
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" disabled>
                    Select one…
                  </option>
                  {SHOOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute top-1/2 right-0 mt-1.5 size-4 -translate-y-1/2 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.25}
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            ) : (
              <input {...shared} type={f.type ?? "text"} autoComplete={f.autoComplete} />
            )}
            {error && (
              <p id={`${id}-error`} className="mt-2 text-[13px] text-[#e08f8f]">
                {error}
              </p>
            )}
          </div>
        );
      })}

      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.message && (
        <p role="alert" className="text-[14px] leading-[1.6] text-[#e08f8f]">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-3 border border-foreground/40 px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
