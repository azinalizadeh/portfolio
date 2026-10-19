"use client";

import { Check } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { cn } from "cn";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/motion";

export type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type FilterChipsProps<T extends string> = {
  options: readonly ChipOption<T>[];
  /** Selected values. */
  value: readonly T[];
  /** Receives the new selection, in the order of `options`. */
  onValueChange: (value: T[]) => void;
  "aria-label": string;
  className?: string;
};

/**
 * Multi-select toggle chips. Selecting floods the chip with coral ink from
 * the click point while the label rolls up into its checked version;
 * deselecting fades back. Chips keep their width and order in both states.
 *
 * Keyboard: the group is one Tab stop (WAI-ARIA toolbar); arrow keys, Home
 * and End move between chips, Space or Enter toggles.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onValueChange,
  "aria-label": ariaLabel,
  className,
}: FilterChipsProps<T>) {
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const selected = new Set(value);

  function toggle(chip: T) {
    const next = new Set(selected);
    if (next.has(chip)) next.delete(chip);
    else next.add(chip);
    onValueChange(options.filter((option) => next.has(option.value)).map((o) => o.value));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1;
    const target = {
      ArrowRight: focusIndex === last ? 0 : focusIndex + 1,
      ArrowDown: focusIndex === last ? 0 : focusIndex + 1,
      ArrowLeft: focusIndex === 0 ? last : focusIndex - 1,
      ArrowUp: focusIndex === 0 ? last : focusIndex - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setFocusIndex(target);
    chipRefs.current[target]?.focus();
  }

  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option, index) => (
        <Chip
          key={option.value}
          ref={(node) => {
            chipRefs.current[index] = node;
          }}
          label={option.label}
          selected={selected.has(option.value)}
          tabIndex={index === Math.min(focusIndex, options.length - 1) ? 0 : -1}
          onFocus={() => setFocusIndex(index)}
          onToggle={() => toggle(option.value)}
        />
      ))}
    </div>
  );
}

type ChipProps = {
  ref: (node: HTMLButtonElement | null) => void;
  label: string;
  selected: boolean;
  tabIndex: number;
  onFocus: () => void;
  onToggle: () => void;
};

/*
 * CSS holds each state's end look (keyed on data-selected), so the server
 * render and reduced motion are already correct. GSAP only plays the change:
 * it animates from the old look to the new one, then clears its inline
 * styles. Each label's end position is a CSS `translate` on a wrapper; GSAP
 * rolls the inner span with an offset that eases to 0, so an interrupted
 * roll continues from where it is.
 */
function Chip({ ref, label, selected, tabIndex, onFocus, onToggle }: ChipProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  // Click point inside the chip; null means start the ink from the center.
  const origin = useRef<{ x: number; y: number } | null>(null);
  const mounted = useRef(false);

  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      const button = buttonRef.current;
      if (!button) return;
      const ink = button.querySelector("[data-ink]");
      const labels = button.querySelectorAll("[data-roll]");
      const check = button.querySelector("[data-check]");
      if (prefersReducedMotion()) {
        gsap.killTweensOf([ink, labels, check]);
        gsap.set([ink, labels, check], { clearProps: "all" });
        return;
      }

      // Continue the roll from its current offset, if one is in flight.
      const offset = Number(gsap.getProperty(labels[0] ?? button, "yPercent")) || 0;
      gsap.fromTo(
        labels,
        { yPercent: selected ? offset + 100 : offset - 100 },
        {
          yPercent: 0,
          ...(selected ? motion.labelRoll : motion.deselect),
          overwrite: true,
          clearProps: "transform",
        },
      );

      if (selected) {
        const { width, height } = button.getBoundingClientRect();
        const x = origin.current?.x ?? width / 2;
        const y = origin.current?.y ?? height / 2;
        // Distance to the farthest corner, so the circle ends fully covering.
        const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
        gsap.fromTo(
          ink,
          { clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 1 },
          {
            clipPath: `circle(${radius}px at ${x}px ${y}px)`,
            ...motion.ink,
            overwrite: true,
            clearProps: "clipPath,opacity",
          },
        );
        gsap.fromTo(
          check,
          { scale: 0, rotation: -45 },
          {
            scale: 1,
            rotation: 0,
            ...motion.check,
            delay: 0.08,
            overwrite: true,
            clearProps: "transform",
          },
        );
      } else {
        gsap.killTweensOf(check);
        gsap.set(check, { clearProps: "transform" });
        gsap.fromTo(
          ink,
          { opacity: 1 },
          { opacity: 0, ...motion.deselect, overwrite: true, clearProps: "clipPath,opacity" },
        );
      }
    },
    { dependencies: [selected] },
  );

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    // detail is 0 for clicks from Space or Enter.
    const box = event.currentTarget.getBoundingClientRect();
    origin.current =
      event.detail === 0 ? null : { x: event.clientX - box.left, y: event.clientY - box.top };
    onToggle();
  }

  return (
    <button
      ref={(node) => {
        buttonRef.current = node;
        ref(node);
      }}
      type="button"
      aria-pressed={selected}
      data-selected={selected}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={onClick}
      className={cn(
        "group relative inline-flex h-8 items-center overflow-hidden rounded-full border px-3 font-mono text-xs",
        "transition-[translate,background-color,border-color] duration-150 hover:-translate-y-px",
        selected
          ? "border-accent/40"
          : "border-border-strong bg-card hover:border-input hover:bg-surface-raised",
      )}
    >
      <span
        aria-hidden
        data-ink
        className="absolute inset-0 bg-accent-soft opacity-0 group-data-[selected=true]:opacity-100"
      />
      <span className="sr-only">{label}</span>
      {/* Both label versions share one grid cell, so the chip is always as
          wide as the checked version and nothing reflows on toggle. */}
      <span aria-hidden className="relative grid overflow-hidden">
        <span className="col-start-1 row-start-1 group-data-[selected=true]:-translate-y-full">
          <span
            data-roll
            className="flex items-center justify-center text-muted-foreground group-hover:text-foreground"
          >
            {label}
          </span>
        </span>
        <span className="col-start-1 row-start-1 translate-y-full group-data-[selected=true]:translate-y-0">
          <span data-roll className="flex items-center gap-1.5 text-accent">
            <Check data-check className="size-3.5 shrink-0" strokeWidth={2.5} />
            {label}
          </span>
        </span>
      </span>
    </button>
  );
}
