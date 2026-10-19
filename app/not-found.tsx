import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-start justify-center gap-6 py-24">
      <p className="font-mono text-xs tracking-wider text-accent uppercase">Error 404</p>
      <h1 className="font-serif text-display">This page doesn&rsquo;t exist.</h1>
      <p className="max-w-xl text-muted-foreground">
        The link may be old, or the address may have a typo. Try the home page or browse the
        projects instead.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/projects">See projects</Link>
        </Button>
      </div>
    </Container>
  );
}
