"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export default function Accent({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={`transition-colors duration-[1600ms] ease-in-out motion-reduce:transition-none ${
        seen ? "text-[#c8a46a]" : "text-foreground"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </span>
  );
}
