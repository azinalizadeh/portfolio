"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { gsap, motion, prefersReducedMotion, useGSAP, useReducedMotion } from "@/lib/motion";

type SwapPanelProps = Omit<ComponentProps<"div">, "children"> & {
  /** Changing this swaps the content: the old children fade out, then the new ones fade in. */
  swapKey: string;
  children: ReactNode;
};

/**
 * Content under SegmentedTabs. On a key change its direct children leave
 * (120ms), then the new children rise in one after another (300ms, 30ms
 * apart). Lay the panel out as the grid or list itself so each item staggers.
 * With reduced motion the new content appears at once.
 */
export function SwapPanel({ swapKey, children, ...props }: SwapPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // What is on screen. It lags behind the props while the old content leaves.
  const [shown, setShown] = useState({ key: swapKey, children });
  const latest = useRef({ key: swapKey, children });
  const exit = useRef<gsap.core.Tween | null>(null);
  const entering = useRef(false);

  // Same key: new children show straight away. Reduced motion: no exit phase.
  if (
    (shown.key === swapKey || reduced) &&
    (shown.key !== swapKey || shown.children !== children)
  ) {
    setShown({ key: swapKey, children });
  }

  useLayoutEffect(() => {
    latest.current = { key: swapKey, children };
  });

  const items = () => (ref.current ? Array.from(ref.current.children) : []);

  // Exit phase, or undoing it when the key flips back before it finished.
  useGSAP(
    () => {
      if (shown.key === swapKey) {
        if (!exit.current?.isActive()) return;
        exit.current.kill();
        gsap.to(items(), {
          opacity: 1,
          y: 0,
          ...motion.deselect,
          overwrite: true,
          clearProps: "opacity,transform",
        });
        return;
      }
      if (prefersReducedMotion()) {
        setShown(latest.current);
        return;
      }
      exit.current = gsap.to(items(), {
        opacity: 0,
        y: -4,
        ...motion.swapOut,
        overwrite: true,
        onComplete: () => {
          entering.current = true;
          setShown(latest.current);
        },
      });
    },
    { dependencies: [swapKey], scope: ref },
  );

  // Enter phase, once the new content has rendered.
  useGSAP(
    () => {
      if (!entering.current) return;
      entering.current = false;
      gsap.fromTo(
        items(),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, ...motion.swapIn, overwrite: true, clearProps: "opacity,transform" },
      );
    },
    { dependencies: [shown.key], scope: ref },
  );

  return (
    <div ref={ref} {...props}>
      {shown.children}
    </div>
  );
}
