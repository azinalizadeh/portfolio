import { defineCollection, defineConfig, s } from "velite";

/** Subdomains the app or the VPS already uses; a project can't take them. */
export const RESERVED_SLUGS = ["www", "app", "api", "mail"] as const;

/**
 * A project slug becomes a DNS label (`<slug>.ROOT_DOMAIN`), so it must be
 * lowercase letters, digits and single hyphens, at most 63 characters.
 */
const subdomainSlug = s
  .string()
  .max(63, "Slug must be at most 63 characters (DNS label limit)")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, digits and single hyphens")
  .refine(
    (value) => !(RESERVED_SLUGS as readonly string[]).includes(value),
    (value) => ({
      message: `"${value}" is reserved (${RESERVED_SLUGS.join(", ")})`,
      // Without this, Velite prints the issue as "info" rather than "error".
      fatal: true,
    }),
  )
  .and(s.unique("projects"));

/** `YYYY-MM`, e.g. `2024-03`. */
const yearMonth = s.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use the format YYYY-MM");

const imageWithAlt = s.object({
  src: s.image(),
  alt: s.string().min(1, "Every image needs alt text"),
});

const videoEmbed = s.object({
  provider: s.enum(["youtube", "loom"]),
  id: s.string().regex(/^[\w-]+$/, "Video id only, not a full URL"),
  title: s.string(),
});

const projects = defineCollection({
  name: "Project",
  pattern: "projects/*/index.mdx",
  schema: s.object({
    title: s.string().max(80),
    slug: subdomainSlug,
    pitch: s.string().max(160),
    type: s.enum(["work", "side"]),
    featured: s.boolean().default(false),
    /** Lower comes first within the featured / non-featured groups. */
    order: s.number().int().default(0),
    date: s.isodate(),
    tags: s.array(s.string()).default([]),
    thumbnail: imageWithAlt,
    liveUrl: s.string().url().optional(),
    repoUrl: s.string().url().optional(),
    problem: s.string(),
    solution: s.string(),
    features: s.array(s.object({ title: s.string(), description: s.string() })).default([]),
    stack: s.array(s.string()).min(1),
    screenshots: s.array(imageWithAlt).default([]),
    video: videoEmbed.optional(),
    results: s
      .array(
        s.object({
          // Coerced so `value: 0` or `value: 52` in YAML is fine.
          value: s.coerce.string(),
          label: s.string(),
        }),
      )
      .default([]),
    body: s.mdx(),
    raw: s.raw(),
  }),
  // No permalink here: a project's URL depends on the host (subdomain), so it
  // comes from `projectUrl(slug)` in lib/hosts.ts (subtask 8).
});

const posts = defineCollection({
  name: "Post",
  pattern: "writing/*.mdx",
  schema: s
    .object({
      title: s.string().max(99),
      slug: s.slug("posts"),
      description: s.string().max(200),
      date: s.isodate(),
      updated: s.isodate().optional(),
      tags: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => ({ ...data, permalink: `/writing/${data.slug}` })),
});

const skills = defineCollection({
  name: "SkillGroup",
  pattern: "skills.yaml",
  schema: s.object({
    name: s.string(),
    summary: s.string(),
    items: s.array(s.string()).min(1),
  }),
});

const experience = defineCollection({
  name: "Experience",
  pattern: "experience.yaml",
  schema: s.object({
    company: s.string(),
    role: s.string(),
    location: s.string(),
    url: s.string().url().optional(),
    start: yearMonth,
    /** Omit for the current role. */
    end: yearMonth.optional(),
    summary: s.string(),
    highlights: s.array(s.string()).default([]),
    stack: s.array(s.string()).default([]),
  }),
});

const education = defineCollection({
  name: "Education",
  pattern: "education.yaml",
  schema: s.object({
    school: s.string(),
    degree: s.string(),
    field: s.string(),
    location: s.string(),
    start: yearMonth,
    end: yearMonth.optional(),
    notes: s.array(s.string()).default([]),
  }),
});

const videos = defineCollection({
  name: "Video",
  pattern: "videos.yaml",
  schema: videoEmbed.extend({
    date: s.isodate(),
    description: s.string(),
    /** `m:ss` or `h:mm:ss`. */
    duration: s
      .string()
      .regex(/^(\d+:)?\d{1,2}:\d{2}$/, "Use m:ss or h:mm:ss")
      .optional(),
  }),
});

const socials = defineCollection({
  name: "Social",
  pattern: "socials.yaml",
  schema: s.object({
    kind: s.enum(["github", "linkedin", "x", "youtube", "email", "rss"]),
    label: s.string(),
    handle: s.string(),
    url: s
      .string()
      .refine((value) => /^(https:\/\/|mailto:)/.test(value), "Use an https:// or mailto: URL"),
  }),
});

export default defineConfig({
  root: "content",
  // `strict` and `clean` are passed per command (package.json scripts and
  // next.config.ts): the Velite CLI always sends its own values, which
  // override anything set here.
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
  },
  collections: {
    projects,
    posts,
    skills,
    experience,
    education,
    videos,
    socials,
  },
  prepare: ({ projects, posts }) => {
    // Featured first, then `order`, then newest.
    projects.sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.order - b.order ||
        b.date.localeCompare(a.date),
    );
    posts.sort((a, b) => b.date.localeCompare(a.date));
  },
});
