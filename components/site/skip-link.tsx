/** First focusable element on every page; jumps past the navbar to `#main`. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-4 left-4 z-60 -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
