import { siteConfig, type SiteFeature } from "@/lib/site-config";

export type NavItem = {
  href: string;
  label: string;
};

type NavEntry = NavItem & { feature?: SiteFeature };

/** Main navigation, in display order. Entries tied to a feature switch hide when it's off. */
const entries: NavEntry[] = [
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/skills", label: "Skills" },
  { href: "/videos", label: "Videos", feature: "videos" },
  { href: "/writing", label: "Writing", feature: "writing" },
  { href: "/contact", label: "Contact" },
];

export const navItems: NavItem[] = entries
  .filter((entry) => !entry.feature || siteConfig.features[entry.feature])
  .map(({ href, label }) => ({ href, label }));

/** True when `pathname` is `href` or a page below it (`/writing/foo` is under `/writing`). */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
