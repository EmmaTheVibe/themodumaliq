"use client";

import { useEffect } from "react";
import { DEVELOPER } from "./site";

let signed = false;

export default function Signature() {
  useEffect(() => {
    if (signed) return;
    signed = true;
    console.log(
      `%c📸 Developed by Shiemo%c\nLike how this site feels? Let’s build yours → ${DEVELOPER}`,
      "font: italic 500 18px/1.8 Georgia, serif; color: #c8a46a; letter-spacing: 0.04em;",
      "font: 12px/1.6 system-ui, sans-serif; color: #999;",
    );
  }, []);

  return null;
}
