import { DEVELOPER } from "./site";

export default function Credit({ className = "" }: { className?: string }) {
  return (
    <a
      href={DEVELOPER}
      target="_blank"
      rel="noopener"
      className={`group text-[10px] tracking-[0.2em] uppercase ${className}`}
    >
      <span className="opacity-40 transition-opacity duration-300 group-hover:opacity-70">Developed by</span>{" "}
      <span className="text-[#c8a46a] opacity-85 transition-opacity duration-300 group-hover:opacity-100">Shiemo</span>
    </a>
  );
}
