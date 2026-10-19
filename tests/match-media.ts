/**
 * jsdom has no matchMedia. This stand-in answers only the reduced-motion
 * query, and `setReducedMotion` flips it and notifies listeners, like the OS
 * setting changing.
 */
let reduced = false;
const listeners = new Set<(event: MediaQueryListEvent) => void>();

export function setReducedMotion(value: boolean) {
  reduced = value;
  for (const listener of listeners) listener({ matches: value } as MediaQueryListEvent);
}

export function installMatchMedia() {
  window.matchMedia = (query: string) =>
    ({
      media: query,
      get matches() {
        return query.includes("prefers-reduced-motion: reduce") && reduced;
      },
      onchange: null,
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
