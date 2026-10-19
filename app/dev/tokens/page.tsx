import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContrastTable, SwatchHex, type ContrastPair } from "./token-readouts";

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

// Class names are written out in full so Tailwind can find them.
const ramps = {
  coral: [
    ["50", "bg-coral-50"],
    ["100", "bg-coral-100"],
    ["200", "bg-coral-200"],
    ["300", "bg-coral-300"],
    ["400", "bg-coral-400"],
    ["500", "bg-coral-500"],
    ["600", "bg-coral-600"],
    ["700", "bg-coral-700"],
    ["800", "bg-coral-800"],
    ["900", "bg-coral-900"],
    ["950", "bg-coral-950"],
  ],
  zinc: [
    ["50", "bg-zinc-50"],
    ["100", "bg-zinc-100"],
    ["200", "bg-zinc-200"],
    ["300", "bg-zinc-300"],
    ["400", "bg-zinc-400"],
    ["500", "bg-zinc-500"],
    ["600", "bg-zinc-600"],
    ["700", "bg-zinc-700"],
    ["800", "bg-zinc-800"],
    ["900", "bg-zinc-900"],
    ["950", "bg-zinc-950"],
  ],
} as const;

const semantic = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["surface-raised", "bg-surface-raised"],
  ["border", "bg-border"],
  ["border-strong", "bg-border-strong"],
  ["foreground", "bg-foreground"],
  ["muted-foreground", "bg-muted-foreground"],
  ["accent", "bg-accent"],
  ["accent-hover", "bg-accent-hover"],
  ["accent-soft", "bg-accent-soft"],
  ["on-accent", "bg-on-accent"],
  ["destructive", "bg-destructive"],
  ["success", "bg-success"],
] as const;

const typeScale = [
  ["Display", "Newsreader · 56/1.05", "font-serif text-display", "Building software people enjoy"],
  ["h1", "Newsreader · 40/1.1", "font-serif text-h1", "Selected projects"],
  ["h2", "Newsreader · 28/1.2", "font-serif text-h2", "Problem and solution"],
  ["h3", "Newsreader · 20/1.3", "font-serif text-h3", "Invoice bot"],
  [
    "Body",
    "Inter · 16/1.7",
    "text-base",
    "I build web apps end to end, from the database to the last pixel. This paragraph shows the body size and line height used for long-form reading.",
  ],
  ["Small", "Inter · 14/1.5", "text-sm", "Shipped March 2026 · 4 min read"],
  ["Mono", "JetBrains Mono · 12", "font-mono text-xs", "TYPESCRIPT · NEXT.JS · POSTGRES"],
] as const;

const spacing = [
  [1, "w-1"],
  [2, "w-2"],
  [3, "w-3"],
  [4, "w-4"],
  [6, "w-6"],
  [8, "w-8"],
  [12, "w-12"],
  [16, "w-16"],
  [24, "w-24"],
] as const;

const radii = [
  ["sm · 6px", "tags", "rounded-sm"],
  ["md · 8px", "buttons, inputs", "rounded-md"],
  ["lg · 12px", "cards", "rounded-lg"],
  ["xl · 14px", "large cards", "rounded-xl"],
  ["full", "pills, chips", "rounded-full"],
] as const;

const contrastPairs: ContrastPair[] = [
  { fg: "--foreground", bg: "--background", min: 4.5 },
  { fg: "--foreground", bg: "--card", min: 4.5 },
  { fg: "--foreground", bg: "--surface-raised", min: 4.5 },
  { fg: "--muted-foreground", bg: "--background", min: 4.5 },
  { fg: "--muted-foreground", bg: "--card", min: 4.5 },
  { fg: "--muted-foreground", bg: "--surface-raised", min: 4.5 },
  { fg: "--accent", bg: "--background", min: 4.5, note: "links, active labels" },
  { fg: "--accent", bg: "--card", min: 4.5 },
  { fg: "--accent", bg: "--accent-soft", min: 4.5, note: "selected chip" },
  { fg: "--foreground", bg: "--accent-soft", min: 4.5 },
  { fg: "--on-accent", bg: "--accent", min: 4.5, note: "primary button" },
  { fg: "--on-accent", bg: "--accent-hover", min: 4.5, note: "primary button, hover" },
  { fg: "--on-accent", bg: "--destructive", min: 4.5, note: "destructive button" },
  { fg: "--destructive", bg: "--background", min: 4.5, note: "error text" },
  { fg: "--destructive", bg: "--card", min: 4.5 },
  { fg: "--success", bg: "--background", min: 4.5, note: "success text" },
  { fg: "--success", bg: "--card", min: 4.5 },
  { fg: "--ring", bg: "--background", min: 3, note: "focus ring (non-text)" },
  { fg: "--ring", bg: "--card", min: 3, note: "focus ring (non-text)" },
  { fg: "--input", bg: "--background", min: 3, note: "input border (non-text)" },
  { fg: "--input", bg: "--card", min: 3, note: "input border (non-text)" },
  {
    fg: "--color-zinc-500",
    bg: "--background",
    min: 4.5,
    note: "must stay below: never use for text",
    expectFail: true,
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t pt-12">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 md:px-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-wider text-accent uppercase">Dev only</p>
        <h1 className="text-display">Design tokens</h1>
        <p className="max-w-2xl text-muted-foreground">
          Every color, size and radius the site is allowed to use. Values are read from the live
          CSS, so this page is always in sync with{" "}
          <code className="text-sm text-foreground">app/globals.css</code>.
        </p>
      </header>

      <Section title="Color ramps">
        {Object.entries(ramps).map(([name, steps]) => (
          <div key={name} className="flex flex-col gap-3">
            <h3 className="capitalize">{name}</h3>
            <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
              {steps.map(([step, className]) => (
                <li key={step} className="flex flex-col gap-1">
                  <div data-swatch className={`h-14 rounded-md border ${className}`} />
                  <span className="text-sm">{step}</span>
                  <SwatchHex />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Semantic colors">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {semantic.map(([name, className]) => (
            <li key={name} className="flex flex-col gap-1">
              <div data-swatch className={`h-16 rounded-lg border ${className}`} />
              <span className="font-mono text-xs">--{name}</span>
              <SwatchHex />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type scale">
        <ul className="flex flex-col gap-8">
          {typeScale.map(([level, spec, className, sample]) => (
            <li key={level} className="grid gap-2 md:grid-cols-[12rem_1fr] md:gap-8">
              <div className="flex flex-col">
                <span className="text-sm">{level}</span>
                <span className="font-mono text-xs text-muted-foreground">{spec}</span>
              </div>
              <p className={`${className} max-w-3xl`}>{sample}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Spacing and radius">
        <ul className="flex flex-col gap-2">
          {spacing.map(([step, className]) => (
            <li key={step} className="flex items-center gap-4">
              <span className="w-16 font-mono text-xs text-muted-foreground">{step * 4}px</span>
              <div className={`h-4 rounded-sm bg-accent ${className}`} />
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-6">
          {radii.map(([name, use, className]) => (
            <li key={name} className="flex flex-col items-start gap-2">
              <div className={`size-20 border border-border-strong bg-card ${className}`} />
              <span className="font-mono text-xs">{name}</span>
              <span className="text-sm text-muted-foreground">{use}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            View projects <ArrowRight />
          </Button>
          <Button variant="outline">
            <Download /> Resume
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">
            <Trash2 /> Destructive
          </Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Next">
            <ArrowRight />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Press Tab to see the focus ring.</p>
      </Section>

      <Section title="Contrast checks">
        <ContrastTable pairs={contrastPairs} />
      </Section>
    </main>
  );
}
