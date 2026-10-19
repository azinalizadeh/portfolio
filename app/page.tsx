import { Container } from "@/components/site/container";
import { siteConfig } from "@/lib/site-config";

// Placeholder until the home page lands (subtask 6).
export default function Home() {
  return (
    <Container className="flex flex-col gap-6 py-24">
      <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        {siteConfig.role}
      </p>
      <h1 className="font-serif text-display">{siteConfig.name}</h1>
      <p className="max-w-2xl text-muted-foreground">{siteConfig.description}</p>
    </Container>
  );
}
