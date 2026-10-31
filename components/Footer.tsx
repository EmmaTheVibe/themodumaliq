import type { ReactNode } from "react";
import { INSTAGRAM } from "./site";
import Year from "./Year";

const socials: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Facebook",
    href: "#",
    icon: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3H9v9h3v-9h2.6l.4-3H12V7a1 1 0 0 1 1-1h2Z" />,
  },
  {
    label: "X",
    href: "#",
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

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-foreground/10 px-6 py-6 text-foreground sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:py-5 md:px-10">
      <ul className="flex items-center gap-6 sm:col-start-2 sm:gap-5">
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
                className="size-[18px]"
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

      <p className="text-center text-[10px] tracking-[0.2em] uppercase opacity-60 sm:col-start-3 sm:justify-self-end sm:text-right">
        © <Year /> themodumaliq photography
      </p>
    </footer>
  );
}
