# Portfolio website: implementation plan

## Context

The user is a software engineer who wants a personal portfolio site. It borrows how aihero.dev organizes content (a landing page per product, a skills catalogue, free posts and videos, AI-readable pages) but has its own look. Every decision below was settled earlier in this conversation through Q&A and live previews. This is a new project with no existing code. It will live in `C:\Users\Asus\Desktop\File\Projects\portfolio`, which doesn't exist yet. It runs locally for now and goes to the user's VPS later.

**The user must review and approve each subtask before it starts.** Before each one I post a short scope note (what I'll do, which files, how it will be checked), wait for an explicit "go", then report the result with screenshots or output.

Machine facts: Node v24.17 and Git 2.54 are installed. **pnpm and Docker are not installed.** pnpm will be enabled through Corepack in subtask 1. The Docker files get written in subtask 14 but can only be tested on the VPS, or locally if the user installs Docker Desktop.

---

## 1. User stories

**Visitor or recruiter**

- US-1: Within 5 seconds, I understand who you are, what you build, and how to reach you (hero plus two calls to action).
- US-2: I can browse projects, featured ones first, and filter by type (All / Work / Side) and by technology.
- US-3: I can open a project's own landing page **at its own subdomain** (`invoice-bot.yourdomain.com`) and read the problem, solution, features, stack, screenshots or video, results, and a link to the live app (`app.invoice-bot.yourdomain.com`) and the repo.
- US-4: I can read your experience and education and download a PDF resume.
- US-5: I can see your skills grouped by area.
- US-6: I can contact you by email or socials, or send a message through a form, and I get clear success and error feedback.
- US-7: The site is fast, readable, and works on a phone, a keyboard, and a screen reader.

**AI assistant or search engine**

- US-8: I can fetch `/llms.txt`, `/llms-full.txt`, `sitemap.xml`, and a `.md` version of every page, so I can cite your work accurately.
- US-9: Pages expose correct metadata, Open Graph images, and structured data (Person, CreativeWork, BreadcrumbList).

**Owner (you)**

- US-10: I add a project by adding one `.mdx` file and images, with no layout code. The build fails clearly if I miss a field.
- US-11: I edit skills, experience, socials, and videos in simple JSON/YAML files.
- US-12: I switch the Videos, Writing, and contact form sections on or off in one config file.
- US-13: I deploy with `docker compose up -d` on my VPS behind Caddy with automatic HTTPS, and add other project apps as subdomains.

## 2. Requirements

### Functional

| ID   | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-1  | Root domain routes: `/`, `/projects`, `/resume`, `/skills`, `/videos` (toggle), `/writing` and `/writing/[slug]` (toggle, off by default), `/contact`, `404`                                                                                                                                                                                                                                                                                 |
| F-1b | **Project subdomains**: `<slug>.ROOT_DOMAIN` serves that project's landing page from the same Next.js app (middleware rewrites by host to an internal route). Unknown subdomains get the 404 page. `/projects/<slug>` on the root domain sends a 301 redirect to `https://<slug>.ROOT_DOMAIN`. The live app runs separately at `app.<slug>.ROOT_DOMAIN` (its own container, linked through `liveUrl`). Locally: `invoice-bot.localhost:3000` |
| F-2  | Home: hero, featured projects, skills preview, short resume, contact block                                                                                                                                                                                                                                                                                                                                                                   |
| F-3  | Project index: segmented tabs (All/Work/Side) and multi-select tech chips combined; featured first, then newest; an empty state when nothing matches                                                                                                                                                                                                                                                                                         |
| F-4  | Project page sections, each rendered only if its data exists: hero, problem, solution, features, stack, gallery (lightbox), demo video (YouTube/Loom), results (metrics), links                                                                                                                                                                                                                                                              |
| F-5  | Resume page and `/resume.pdf` built from the same data file at build time                                                                                                                                                                                                                                                                                                                                                                    |
| F-6  | Contact form: name, email, message, a hidden spam-trap field, rate limit (5 per 10 minutes per IP), email sent through SMTP; switchable in config with a links-only fallback                                                                                                                                                                                                                                                                 |
| F-7  | AI-readable: on the root domain, `/llms.txt` (links to every project subdomain's `.md`), `/llms-full.txt`, `/sitemap.xml`, `/robots.txt` and a `.md` version of every page. **On each project subdomain**, its own `/index.md`, `/llms.txt`, `/robots.txt` and `/sitemap.xml`, because search engines treat each subdomain as a separate site                                                                                                |
| F-8  | Metadata on every page: title template, description, canonical URL (root pages use `SITE_URL`; project pages use `https://<slug>.ROOT_DOMAIN`), Open Graph/Twitter cards, generated OG images, JSON-LD                                                                                                                                                                                                                                       |
| F-9  | Navigation on project subdomains uses absolute links back to the root domain (home, other projects, contact)                                                                                                                                                                                                                                                                                                                                 |

### Non-functional

| ID  | Requirement                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N-1 | Performance: Lighthouse ≥ 95 on all four categories, LCP < 2.0s, CLS < 0.05, under 120KB of first-load JS on the home page                                                         |
| N-2 | Accessibility: WCAG 2.2 AA, meaning text contrast ≥ 4.5:1, a visible focus ring, full keyboard support, a skip link, aria attributes on tabs and toggles, reduced motion respected |
| N-3 | Responsive design tested at 375, 768, 1024 and 1440px, with no horizontal scroll                                                                                                   |
| N-4 | Dark mode only; all colors are CSS tokens, so a light theme can be added later without touching components                                                                         |
| N-5 | Security: secrets in env vars only, a CSP and security headers, form input checked on the server, no secrets in the client bundle                                                  |
| N-6 | Content is validated at build time by Velite/Zod, and broken content fails the build                                                                                               |
| N-7 | English only, no analytics, no cookies                                                                                                                                             |

## 3. Tech stack

| Layer     | Choice                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------ |
| Runtime   | Node 24 (VPS: `node:24-alpine`), pnpm via Corepack                                                     |
| Framework | Next.js App Router (latest stable at init, pinned), React 19, TypeScript strict                        |
| Styling   | Tailwind CSS v4 (`@theme inline` tokens), shadcn/ui (Radix), `lucide-react` icons                      |
| Content   | Velite (MDX + JSON/YAML, Zod schemas, image processing)                                                |
| Motion    | GSAP 3.13+ with the Flip plugin, `@gsap/react` (`useGSAP`)                                             |
| Fonts     | `next/font/google`: Newsreader, Inter, JetBrains Mono (self-hosted, no layout shift)                   |
| Forms     | Server Action, Zod, `nodemailer` (SMTP); in-memory rate limiter                                        |
| PDF       | `@react-pdf/renderer`, run as a build-time script that writes `public/resume.pdf`                      |
| SEO/AI    | `next/og` OG images, `app/sitemap.ts`, `app/robots.ts`, route handlers for `.md` and `llms*.txt`       |
| Quality   | ESLint, Prettier, Vitest + Testing Library, Playwright + `@axe-core/playwright`, Lighthouse CI (local) |
| Deploy    | Docker multi-stage build with `output: 'standalone'`, `docker-compose.yml`, Caddy 2                    |

## 4. Design

**Direction:** minimal editorial, dark only, one accent color.

**Color tokens** (in `app/globals.css`):

- Primitives: the coral ramp (50–950, `coral-300 = #FFADAD`) and the zinc ramp
- Semantic tokens:

| Token                | Value        |
| -------------------- | ------------ |
| `--background`       | `#0C0C0E`    |
| `--card`             | `#161618`    |
| `--surface-raised`   | `#1F1F23`    |
| `--border`           | `#27272A`    |
| `--border-strong`    | `#3F3F46`    |
| `--foreground`       | `#F4F4F5`    |
| `--muted-foreground` | `#A1A1AA`    |
| `--accent`           | `#FFADAD`    |
| `--accent-hover`     | `#FFC7C7`    |
| `--on-accent`        | `#0C0C0E`    |
| `--accent-soft`      | coral at 14% |
| `--destructive`      | `#F87171`    |
| `--success`          | `#4ADE80`    |

- Zinc `#71717A` is never used for text, since it's only 4.0:1 on the background.

**Typography:**

| Level              | Font           | Size / line height |
| ------------------ | -------------- | ------------------ |
| Display            | Newsreader     | 56/1.05            |
| h1                 | Newsreader     | 40/1.1             |
| h2                 | Newsreader     | 28/1.2             |
| h3                 | Newsreader     | 20/1.3             |
| Body               | Inter          | 16/1.7             |
| Small              | Inter          | 14/1.5             |
| Mono (tags, dates) | JetBrains Mono | 12                 |

**Spacing:** steps of 4, 8, 12, 16, 24, 32, 48, 64 and 96px.

**Radius:** 6px for tags, 8px for buttons and inputs, 12–14px for cards, fully round for pills and chips.

**Components** (the approved previews):

- Floating pill navbar, editorial split hero
- Project card (hover zoom, whole card clickable) and project index row (cursor-following cover)
- `SegmentedTabs`, `FilterChips`
- Bento skills grid, expandable experience timeline
- Problem/solution blocks, feature cards, metric cards, quote, code block (with copy)
- Lightbox gallery, video embed (loads only when clicked), pill pagination
- Contact form (checks fields as you leave them, error summary at the top, sending/success/error states)
- Toasts, empty state, skeleton, footer

**Motion spec:**

| Where                                         | What                                                                                                                                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SegmentedTabs` and single-select chip groups | **Shared element**: GSAP Flip, power3.inOut, 450ms; content swaps out in 120ms and in over 300ms with a 30ms stagger                                                                                |
| `FilterChips` (multi-select tech)             | **Ink + label roll**: clip-path circle from the click point, power2.out 500ms; label rolls with yPercent in 350ms; check appears with back.out; deselecting fades out in 150ms; chips never reorder |
| Global                                        | 1px hover lift (150ms), 8px fade-up as sections scroll in (300–400ms)                                                                                                                               |

Every animation uses `overwrite: true` (a new click cancels the old animation), and all motion turns off under `prefers-reduced-motion`. The design system is also saved as `design-system/MASTER.md` using the ui-ux-pro-max skill.

## 5. Architecture and content model

```
portfolio/
  app/
    layout.tsx  page.tsx  globals.css  not-found.tsx
    projects/page.tsx
    sites/[slug]/page.tsx  sites/[slug]/opengraph-image.tsx   # internal; reached only via host rewrite
    sites/[slug]/(llms.txt|robots.txt|sitemap.xml|index.md)/route.ts
    api/tls-allow/route.ts        # Caddy on-demand TLS "ask" endpoint: 200 only for known slugs
  middleware.ts                   # host routing: <slug>.ROOT_DOMAIN → /sites/<slug>/*, unknown → 404,
                                  # root /projects/<slug> → 301, direct /sites/* on root → 404
    resume/page.tsx  skills/page.tsx  videos/page.tsx  writing/...  contact/page.tsx
    contact/actions.ts            # Server Action
    llms.txt/route.ts  llms-full.txt/route.ts  sitemap.ts  robots.ts
    [...md]/route.ts              # serves *.md versions (rewrites from /x.md)
  components/ui/                  # shadcn primitives (button, dialog, tooltip, ...)
  components/site/                # nav, footer, hero, project-card, segmented-tabs, filter-chips, timeline, ...
  content/
    projects/*.mdx  writing/*.mdx
    skills.yaml  experience.yaml  education.yaml  videos.yaml  socials.yaml
  lib/  site-config.ts  hosts.ts (projectUrl(slug), rootUrl(path), parseHost)  markdown.ts  seo.ts  rate-limit.ts  mail.ts  motion.ts
  scripts/build-resume-pdf.tsx
  public/images/...
  velite.config.ts  next.config.ts  Dockerfile  docker-compose.yml  Caddyfile  .env.example
  tests/ (vitest)  e2e/ (playwright)
```

**Velite collections:**

- `projects`: `title`, `slug`, `pitch`, `type`, `featured`, `order`, `date`, `tags[]`, `thumbnail`, `liveUrl?`, `repoUrl?`, `problem`, `solution`, `features[]`, `stack[]`, `screenshots[]`, `video?`, `results[]`, MDX body, raw markdown
- `posts`
- `skills` (groups → items)
- `experience`, `education`
- `videos`
- `socials`

**`lib/site-config.ts`:** `name`, `role`, `SITE_URL`, `ROOT_DOMAIN`, `features: { videos, writing, contactForm }`.

**Subdomain routing:** a slug list from Velite (`.velite/projects.json`) is imported into the middleware. Every link to a project goes through `projectUrl(slug)`, which gives `https://<slug>.ROOT_DOMAIN`, or `http://<slug>.localhost:3000` in development. Reserved slugs (`www`, `app`, `api`, `mail`) are rejected by the schema.

**Markdown endpoints:** each page has a `toMarkdown()` built from the same Velite data. Project MDX bodies are served from their raw source. `llms.txt` follows the llmstxt.org format: a title, a summary, then sections linking to the `.md` URLs. `llms-full.txt` joins all the page markdown together.

## 6. Environment and deployment

- `.env.example`: `SITE_URL`, `ROOT_DOMAIN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`, `CONTACT_FROM`
- Dockerfile: deps → build (velite, then the PDF script, then `next build`) → runner (standalone, non-root user, port 3000)
- `docker-compose.yml`: a `portfolio` service plus a `caddy` service (ports 80/443, volumes for certificates), and a commented example app service (`invoice-bot-app`)
- `Caddyfile`:
  - `{$ROOT_DOMAIN}` goes to `portfolio:3000`.
  - One explicit block per live app, e.g. `app.invoice-bot.{$ROOT_DOMAIN}` goes to `invoice-bot-app:3000`.
  - A catch-all HTTPS block sends any other subdomain to `portfolio:3000` with **on-demand TLS**. Caddy first asks `http://portfolio:3000/api/tls-allow?domain=…`, so certificates are only issued for real project slugs. This avoids wildcard certificates, which would need a DNS-provider plugin, and wildcards don't cover `app.<slug>` anyway.
- DNS (deploy guide): an A record for `@`, a wildcard A record for `*` (covers every `<slug>` landing page), and one A record per live app (`app.<slug>`), because DNS wildcards only match one label.
- README section on deploying to the VPS, adding a project, and adding a live app

---

## 7. Subtasks (each needs your approval before it starts)

| #   | Subtask                                      | What gets delivered                                                                                                                                                                                                                | Done when                                                                                                                                                                            |
| --- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Project setup**                            | Enable pnpm via Corepack; create the Next.js app in `Projects\portfolio`; TypeScript strict, ESLint/Prettier; `git init` plus a first commit                                                                                       | `pnpm dev` serves the starter page; lint passes                                                                                                                                      |
| 2   | **Design tokens and fonts**                  | Tailwind v4 tokens (coral/zinc, semantic), the 3 fonts, base typography, focus styles, reduced-motion base; shadcn initialized and themed; `design-system/MASTER.md`                                                               | A `/dev/tokens` page shows ramps, the type scale and buttons; contrast checks pass                                                                                                   |
| 3   | **Content layer**                            | Velite config and Zod schemas; placeholder content (4 projects: 2 work and 2 side, 2 featured; skills, experience, education, socials, 1 video, 1 post); `site-config.ts` with feature switches                                    | `pnpm build` validates content; a deliberately bad field fails the build                                                                                                             |
| 4   | **Layout shell**                             | Floating pill navbar (sliding active indicator, mobile menu), footer, skip link, 404, page container                                                                                                                               | Keyboard and mobile navigation work; screenshots at 375 and 1440px                                                                                                                   |
| 5   | **Motion components**                        | `SegmentedTabs` (Flip shared element), `FilterChips` (ink + label roll), `useReducedMotion`, Vitest tests for state and aria                                                                                                       | Matches the approved preview; arrow keys work; reduced motion snaps straight to the end state                                                                                        |
| 6   | **Home page**                                | Editorial split hero, stats, featured project cards, skills bento preview, short resume, contact block                                                                                                                             | Matches the approved previews; Lighthouse check                                                                                                                                      |
| 7   | **Projects index**                           | Tabs and chips combined filter, cards/index-row view, empty state, staggered grid swap                                                                                                                                             | Filtering is correct (unit test); visual check                                                                                                                                       |
| 8   | **Project subdomains and landing page**      | `middleware.ts` host routing, `lib/hosts.ts`, internal `/sites/[slug]` page with all F-4 sections, lightbox, click-to-load video, prev/next project, OG image, 301 from `/projects/<slug>`, absolute root-domain nav on subdomains | `invoice-bot.localhost:3000` renders the landing page; an unknown subdomain gives 404; `localhost:3000/projects/invoice-bot` sends a 301 to the subdomain; middleware has unit tests |
| 9   | **Resume, skills, videos and writing pages** | Resume timeline, PDF script with a download button, skills page, videos page and writing pages behind their switches                                                                                                               | The PDF opens and matches the page; switches hide routes (404) and nav links                                                                                                         |
| 10  | **Contact**                                  | Contact page and section, Server Action, Zod, spam trap, rate limit, nodemailer, success and error toasts, links-only fallback                                                                                                     | Form checks fields as you leave them, shows the error summary, sends through a test SMTP server (Ethereal) locally                                                                   |
| 11  | **SEO and AI-readability**                   | Metadata helpers, JSON-LD, root sitemap/robots/`llms.txt`/`llms-full.txt`/`.md` routes, plus each subdomain's own `index.md`, `llms.txt`, robots and sitemap; canonical URLs per host                                              | `curl` of each endpoint on the root and on `invoice-bot.localhost:3000` returns valid output; markdown matches the pages                                                             |
| 12  | **Polish and accessibility**                 | Scroll-reveal, hover micro-interactions, image optimization, security headers/CSP, responsive pass at all breakpoints                                                                                                              | axe shows no serious issues; no horizontal scroll at 375px                                                                                                                           |
| 13  | **Testing and quality**                      | Playwright tests for the main journeys (nav, filter, project page, contact, PDF, `.md`), axe in end-to-end tests, Lighthouse run, README "how to add a project"                                                                    | All tests pass; Lighthouse ≥ 95                                                                                                                                                      |
| 14  | **Docker and deploy files**                  | `output: 'standalone'`, Dockerfile, `docker-compose.yml`, Caddyfile (root, per-app blocks, on-demand TLS catch-all), `/api/tls-allow`, `.env.example`, VPS and DNS deploy guide                                                    | The build works locally with `pnpm build && node .next/standalone/server.js`; Docker is tested on the VPS or with Docker Desktop                                                     |

**Process for each subtask:**

1. I post its scope note.
2. You approve.
3. I build it.
4. I show the result: screenshots in the in-app browser and test output.
5. You accept, or ask for changes.
6. I commit (only with your OK) and move to the next.

## 8. Verification (end to end)

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass.
- `pnpm start`, then walk through every route in the in-app browser at 375 and 1440px and check the motion against the approved previews.
- `curl /llms.txt`, `/llms-full.txt`, `/sitemap.xml`; open `/resume.pdf`.
- Subdomains: open `http://invoice-bot.localhost:3000` (landing page), `http://nope.localhost:3000` (404) and `localhost:3000/projects/invoice-bot` (301); `curl http://invoice-bot.localhost:3000/index.md` and `/llms.txt`; `curl localhost:3000/api/tls-allow?domain=invoice-bot.<root>` returns 200, and an unknown domain returns 404.
- `pnpm e2e` (Playwright and axe) passes; the Lighthouse report is ≥ 95 in all four categories.
- Turn each feature switch off and confirm its routes return 404 and its nav links disappear.
- Contact form: send a test message through Ethereal SMTP; the 6th rapid submit gets a rate-limit message.

## Risks and notes

- No Docker on this machine, so deploy files are verified on the VPS (or with Docker Desktop if installed).
- `*.localhost` resolves automatically in Chrome and Edge, so local subdomain testing needs no hosts-file edits. Firefox may need `network.dns.native-is-localhost`.
- Each subdomain is a separate site for SEO. Its own sitemap and robots file cover this; adding the root domain to Google Search Console as a Domain property covers every subdomain.
- Velite and Next.js versions: pin the latest stable versions at setup and confirm they work together during subtask 3.
- GSAP Flip is free (GSAP 3.13+ licence) and `useGSAP` handles cleanup when pages change.

---

## Progress log

- **Subtask 1 (project setup) — done 2026-10-19.** pnpm 12.14.0 was already installed globally, so Corepack wasn't needed. Scaffolded with `create-next-app` 16.4.2: Next.js 16.4.2, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 5.9.3 (strict plus `noUncheckedIndexedAccess`), ESLint 9 with `eslint-config-prettier`, Prettier 3 with the Tailwind plugin. All versions pinned exactly.
