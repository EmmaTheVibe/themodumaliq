"use client";

import { useEffect, useState, type ReactNode } from "react";
import Categories from "./Categories";
import Intro from "./intro/Intro";
import Navbar from "./Navbar";
import ScrollCue from "./ScrollCue";

export default function Landing({ footer }: { footer: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [revealed]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <Navbar visible={revealed} />
      <Categories visible={revealed} />
      {footer}
      <ScrollCue visible={revealed} />
      {!revealed && <Intro onComplete={() => setRevealed(true)} />}
    </div>
  );
}
