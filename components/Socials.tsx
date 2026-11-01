import type { ReactNode } from "react";
import { INSTAGRAM, WHATSAPP, X } from "./site";

const socials: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "WhatsApp",
    href: WHATSAPP,
    icon: (
      <>
        <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3a8.5 8.5 0 1 1 15.5-4.6Z" />
        <path d="M7.8 7.87c.2-.5.5-.6.8-.6h.6c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c-.1.1-.1.3 0 .5.6 1.1 1.5 2 2.6 2.6.2.1.4.1.5 0l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.6c0 .3-.1.6-.6.8-.6.3-1.4.4-2.4 0-2.1-.8-3.8-2.5-4.6-4.6-.4-1-.3-1.8 0-2.4Z" />
      </>
    ),
  },
  {
    label: "X",
    href: X,
    icon: <path d="M4 4h4.5L20 20h-4.5ZM20 4l-6.6 7.5M4 20l6.6-7.5" />,
  },
  {
    label: "Instagram",
    href: INSTAGRAM,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </>
    ),
  },
];

export default function Socials({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {socials.map((social) => (
        <li key={social.label}>
          <a
            href={social.href}
            aria-label={social.label}
            {...(social.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="block opacity-70 transition-opacity hover:opacity-100"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {social.icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
