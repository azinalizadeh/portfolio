"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useSyncExternalStore } from "react";

gsap.registerPlugin(useGSAP, Flip);

export { Flip, gsap, useGSAP };

/** Timings from the motion spec (MASTER: Motion), in seconds. */
export const motion = {
  /** SegmentedTabs shared element. */
  flip: { duration: 0.45, ease: "power3.inOut" },
  /** Content swap under SegmentedTabs: out, then in with a stagger. */
  swapOut: { duration: 0.12, ease: "power1.in" },
  swapIn: { duration: 0.3, ease: "power2.out", stagger: 0.03 },
  /** FilterChips. */
  ink: { duration: 0.5, ease: "power2.out" },
  labelRoll: { duration: 0.35, ease: "power3.out" },
  check: { duration: 0.35, ease: "back.out(2.5)" },
  deselect: { duration: 0.15, ease: "power1.out" },
} as const;

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reads the media query at call time. Animation code calls this when it is
 * about to animate, so a setting changed mid-session takes effect at once.
 */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the user asked for reduced motion, kept in sync with the OS
 * setting. It is `false` during server rendering and hydration.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
