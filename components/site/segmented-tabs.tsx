"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "cn";
import { Flip, gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/motion";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  /** Shown after the label in mono, e.g. the number of matching items. */
  count?: number;
};

type SegmentedTabsProps<T extends string> = {
  /** Base id; each tab gets `segmentedTabId(id, value)`. */
  id: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  "aria-label": string;
  /** Id of the panel these tabs control (its `role="tabpanel"`). */
  panelId?: string;
  className?: string;
};

/** Id of one tab, for the panel's `aria-labelledby`. */
export function segmentedTabId(id: string, value: string) {
  return `${id}-tab-${value}`;
}

/**
 * Single-select tabs. The active fill is one shared element that moves into
 * the chosen tab with GSAP Flip. Follows the WAI-ARIA tabs pattern with
 * automatic activation: arrow keys, Home and End move focus and select.
 */
export function SegmentedTabs<T extends string>({
  id,
  options,
  value,
  onValueChange,
  "aria-label": ariaLabel,
  panelId,
  className,
}: SegmentedTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());
  // Where the fill was just before a change we started, so Flip can animate
  // from there. A change made by the parent alone has no state and snaps.
  const flipState = useRef<Flip.FlipState | null>(null);
  const flipId = `${id}-indicator`;

  useGSAP(
    () => {
      const state = flipState.current;
      flipState.current = null;
      const indicator = listRef.current?.querySelector<HTMLElement>(`[data-flip-id="${flipId}"]`);
      if (!state || !indicator || prefersReducedMotion()) return;
      Flip.from(state, {
        targets: indicator,
        ...motion.flip,
        // Leave no inline size behind, so the fill keeps tracking its tab.
        onComplete: () => void gsap.set(indicator, { clearProps: "all" }),
      });
    },
    { dependencies: [value], scope: listRef },
  );

  function select(next: T) {
    if (next === value) return;
    const indicator = listRef.current?.querySelector(`[data-flip-id="${flipId}"]`);
    // Measured mid-flight too, so a fast second click starts where the fill is.
    if (indicator) flipState.current = Flip.getState(indicator);
    onValueChange(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = options.findIndex((option) => option.value === value);
    const last = options.length - 1;
    const target = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    const next = target === undefined ? undefined : options[target];
    if (!next) return;
    event.preventDefault();
    select(next.value);
    tabRefs.current.get(next.value)?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cn("inline-flex w-fit max-w-full rounded-full border bg-card p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              if (node) tabRefs.current.set(option.value, node);
              else tabRefs.current.delete(option.value);
            }}
            type="button"
            role="tab"
            id={segmentedTabId(id, option.value)}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => select(option.value)}
            className={cn(
              "relative flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-150",
              active ? "text-accent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <span
                aria-hidden
                data-flip-id={flipId}
                className="absolute inset-0 rounded-full bg-accent-soft"
              />
            )}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && (
              <span className="relative font-mono text-xs">{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
