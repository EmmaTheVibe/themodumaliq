import Link from "next/link";
import Socials from "./Socials";
import Year from "./Year";

const links = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-foreground/10 px-6 py-6 text-foreground sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:py-5 md:px-10">
      <ul className="flex items-center gap-6 sm:justify-self-start md:hidden">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-display text-[14px] font-medium tracking-[0.18em] uppercase opacity-80 transition-opacity hover:opacity-100"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <Socials className="flex items-center gap-6 sm:col-start-2 sm:gap-5" />

      <p className="text-center text-[10px] tracking-[0.2em] uppercase opacity-60 sm:col-start-3 sm:justify-self-end sm:text-right">
        © <Year /> themodumaliq photography
      </p>
    </footer>
  );
}
