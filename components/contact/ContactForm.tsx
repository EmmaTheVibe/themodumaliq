"use client";

import { useActionState, useState } from "react";
import { sendMessage, type ContactState, type Field } from "@/app/contact/actions";
import { LIMITS } from "./rules";
import ShootSelect from "./ShootSelect";

const initial: ContactState = { status: "idle" };

const FIELD =
  "mt-3 w-full border-0 border-b border-foreground/30 bg-transparent px-0 py-2.5 text-[16px] font-light outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground aria-invalid:border-[#d97a7a]";

const fields: { name: Field; label: string; type?: string; autoComplete?: string; max?: number }[] = [
  { name: "name", label: "Name", autoComplete: "name", max: LIMITS.name },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", max: LIMITS.email },
  { name: "shoot", label: "Kind of shoot" },
  { name: "message", label: "Message", max: LIMITS.message },
];

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, initial);
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(0);
  const [counted, setCounted] = useState(state);
  if (state !== counted) {
    setCounted(state);
    setCount(state.values?.message.length ?? 0);
    setRound((r) => r + 1);
  }

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
          maxLength: f.max,
          defaultValue: state.values?.[f.name],
          "aria-invalid": error ? true : undefined,
          "aria-describedby":
            [error && `${id}-error`, f.name === "message" && `${id}-count`].filter(Boolean).join(" ") || undefined,
          className: `block ${FIELD}`,
        };
        return (
          <div key={f.name}>
            <label htmlFor={id} id={`${id}-label`} className="text-[11px] tracking-[0.3em] uppercase opacity-80">
              {f.label} <span aria-hidden>*</span>
            </label>
            {f.name === "message" ? (
              <>
                <textarea
                  {...shared}
                  rows={5}
                  onInput={(e) => setCount(e.currentTarget.value.length)}
                  className={`${shared.className} resize-y`}
                />
                <p
                  id={`${id}-count`}
                  className={`mt-2 text-right text-[11px] tracking-[0.1em] tabular-nums transition-colors ${
                    count >= LIMITS.message ? "text-[#e08f8f]" : count >= LIMITS.message * 0.9 ? "opacity-90" : "opacity-50"
                  }`}
                >
                  {count.toLocaleString("en")} / {LIMITS.message.toLocaleString("en")}
                </p>
              </>
            ) : f.name === "shoot" ? (
              <ShootSelect
                key={round}
                id={id}
                name={f.name}
                labelId={`${id}-label`}
                defaultValue={state.values?.shoot}
                invalid={Boolean(error)}
                describedBy={shared["aria-describedby"]}
                className={FIELD}
              />
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
