import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "#content";
import { Container } from "@/components/site/container";
import { MotionDemo, type DemoProject } from "./motion-demo";

export const metadata: Metadata = {
  title: "Motion",
  robots: { index: false, follow: false },
};

export default function MotionPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const demoProjects: DemoProject[] = projects.map(({ slug, title, pitch, type, stack }) => ({
    slug,
    title,
    pitch,
    type,
    stack,
  }));

  return (
    <Container className="flex flex-col gap-12 py-16">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-wider text-accent uppercase">Dev only</p>
        <h1 className="text-display">Motion</h1>
        <p className="max-w-2xl text-muted-foreground">
          SegmentedTabs, FilterChips and SwapPanel wired to the placeholder projects. Turn on
          reduced motion in the OS (or DevTools rendering panel) and every change should snap
          straight to its end state.
        </p>
      </header>
      <MotionDemo projects={demoProjects} />
    </Container>
  );
}
