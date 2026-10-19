/**
 * Site-wide settings. Content (projects, skills, ...) lives in content/;
 * this file is for identity, URLs and feature switches.
 */

/** Placeholder identity. Replace with your own. */
const identity = {
  name: "Azin",
  role: "Software Engineer",
  description:
    "Software engineer building fast, accessible web products and the services behind them.",
} as const;

/**
 * Feature switches. A switched-off section's routes return 404 and its nav
 * links disappear.
 */
const features = {
  videos: true,
  writing: false,
  contactForm: true,
} as const;

/** Strips a trailing slash so `${SITE_URL}${path}` never doubles it. */
function trimSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Public URL of the root domain, e.g. `https://example.com`. */
const SITE_URL = trimSlash(process.env.SITE_URL ?? "http://localhost:3000");

/**
 * Root domain without protocol or port, e.g. `example.com`. Project landing
 * pages live at `<slug>.ROOT_DOMAIN`.
 */
const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? new URL(SITE_URL).hostname;

export const siteConfig = {
  ...identity,
  SITE_URL,
  ROOT_DOMAIN,
  features,
} as const;

export type SiteFeature = keyof typeof features;
