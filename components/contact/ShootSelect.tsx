"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { SHOOTS } from "./shoots";

type Props = {
  id: string;
  name: string;
  labelId: string;
  className: string;
  defaultValue?: string;
  invalid?: boolean;
  describedBy?: string;
};

export default function ShootSelect({ id, name, labelId, className, defaultValue = "", invalid, describedBy }: Props) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const show = () => {
    setActive(Math.max(0, SHOOTS.indexOf(value)));
    setOpen(true);
  };

  const choose = (i: number) => {
    setValue(SHOOTS[i]);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = SHOOTS.length - 1;
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(last, a + 1)),
      ArrowUp: () => setActive((a) => Math.max(0, a - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => setOpen(false),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      move();
      return;
    }
    if (e.key.length === 1) {
      const key = e.key.toLowerCase();
      const order = [...SHOOTS.slice(active + 1), ...SHOOTS.slice(0, active + 1)];
      const match = order.find((s) => s.toLowerCase().startsWith(key));
      if (match) setActive(SHOOTS.indexOf(match));
    }
  };

  return (
    <div ref={root} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${id}`}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-required
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={(e) => {
          if (e.detail === 0) return;
          if (open) setOpen(false);
          else show();
        }}
        onKeyDown={onKeyDown}
        className={`${className} flex cursor-pointer items-center justify-between gap-4 text-left`}
      >
        <span className={value ? undefined : "text-foreground/40"}>{value || "Select one…"}</span>
        <svg
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 opacity-70 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <ul
        ref={list}
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        className={`absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-y-auto overscroll-contain border border-foreground/15 bg-background py-2 shadow-[0_18px_40px_rgba(0,0,0,0.6)] transition-[opacity,translate,visibility] duration-200 ${
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
        }`}
      >
        {SHOOTS.map((shoot, i) => {
          const selected = shoot === value;
          return (
            <li
              key={shoot}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={selected}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
              className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-[15px] font-light transition-colors ${
                i === active ? "bg-[#c8a46a] text-background" : selected ? "text-[#c8a46a]" : ""
              }`}
            >
              {shoot}
              {selected && (
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
