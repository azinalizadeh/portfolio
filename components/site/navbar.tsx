"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { isActivePath, type NavItem } from "@/lib/navigation";

type NavbarProps = {
  name: string;
  items: NavItem[];
};

/**
 * Floating pill navbar. On desktop the active link sits on a coral pill that
 * slides between links; below 768px the links move into a dropdown panel.
 */
export function Navbar(props: NavbarProps) {
  // With Cache Components, usePathname can suspend on routes with params
  // unknown at build time. The fallback is the same bar with nothing active.
  return (
    <Suspense fallback={<NavbarView {...props} pathname={null} />}>
      <NavbarWithPathname {...props} />
    </Suspense>
  );
}

function NavbarWithPathname(props: NavbarProps) {
  return <NavbarView {...props} pathname={usePathname()} />;
}

function NavbarView({ name, items, pathname }: NavbarProps & { pathname: string | null }) {
  const activeHref = pathname
    ? items.find((item) => isActivePath(pathname, item.href))?.href
    : undefined;
  const { open, rootRef, toggleRef, panelId, toggle, close } = useMobileMenu();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-8">
      <nav
        ref={rootRef}
        aria-label="Main"
        className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-6 rounded-full border bg-card py-2 pr-2 pl-5 shadow-nav md:w-fit md:pl-6"
      >
        <Link
          href="/"
          className="font-serif text-xl text-foreground"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          {name}
        </Link>

        <DesktopLinks items={items} activeHref={activeHref} />

        <Button
          ref={toggleRef}
          variant="ghost"
          size="icon"
          className="size-10 rounded-full md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={toggle}
        >
          {open ? <X /> : <Menu />}
        </Button>

        <div
          id={panelId}
          hidden={!open}
          className="absolute inset-x-0 top-full mt-2 animate-in rounded-xl border bg-card p-2 shadow-nav duration-200 fade-in slide-in-from-top-2 md:hidden"
        >
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = item.href === activeHref;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={close}
                    className={cn(
                      "flex h-12 items-center rounded-lg px-4 font-medium transition-colors duration-150",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}

function DesktopLinks({ items, activeHref }: { items: NavItem[]; activeHref?: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; right: number } | null>(null);
  // The pill appears in place on first paint and only slides on later changes.
  const [animate, setAnimate] = useState(false);

  const measure = useCallback(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!list || !link) {
      setIndicator(null);
      return;
    }
    const listBox = list.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    setIndicator({ left: linkBox.left - listBox.left, right: linkBox.right - listBox.left });
  }, []);

  useLayoutEffect(measure, [measure, activeHref]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Link widths change when the web font swaps in or the window resizes.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure]);

  return (
    <ul ref={listRef} className="relative hidden items-center md:flex">
      {/* One full-width coral layer, clipped down to the active link. Animating
          clip-path keeps the pill's rounded ends intact while it slides. */}
      <li
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full bg-accent-soft",
          animate && "transition-[clip-path,opacity] duration-[350ms] ease-out-quart",
          !indicator && "opacity-0",
        )}
        style={{
          clipPath: indicator
            ? `inset(0 calc(100% - ${indicator.right}px) 0 ${indicator.left}px round 9999px)`
            : "inset(0 50% 0 50% round 9999px)",
        }}
      />
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-150",
                active ? "text-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Disclosure-pattern state for the phone menu. While open it closes on
 * Escape (focus returns to the toggle), on a click outside the navbar, and
 * when the window widens past 768px.
 */
function useMobileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 48rem)");
    function onWiden() {
      if (desktop.matches) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onWiden);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onWiden);
    };
  }, [open]);

  return {
    open,
    rootRef,
    toggleRef,
    panelId,
    toggle: () => setOpen((value) => !value),
    close: () => setOpen(false),
  };
}
