import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { socials } from "#content";
import { Container } from "@/components/site/container";
import { navItems } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";

const linkClass =
  "text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground";

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <Container className="grid gap-12 py-12 md:grid-cols-[1fr_auto_auto] md:gap-16">
        <div className="flex max-w-sm flex-col gap-2">
          <Link href="/" className="font-serif text-h3 text-foreground">
            {siteConfig.name}
          </Link>
          <p className="text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="mb-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Pages
          </h2>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Elsewhere
          </h2>
          <ul className="flex flex-col gap-2">
            {socials.map((social) => {
              const external = social.url.startsWith("https://");
              return (
                <li key={social.url}>
                  <a
                    href={social.url}
                    className={`${linkClass} inline-flex items-center gap-1`}
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {social.label}
                    {external && (
                      <>
                        <ArrowUpRight className="size-3.5" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
