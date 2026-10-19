import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { education, experience, posts, projects, skills, socials, videos } from "#content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false },
};

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2>
        {title} <span className="font-mono text-xs text-muted-foreground">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-border-strong px-2 py-0.5 font-mono text-xs text-muted-foreground">
      {children}
    </span>
  );
}

/** Dev-only readout of everything Velite produced from content/. */
export default function ContentPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 md:px-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          Dev · content layer
        </p>
        <h1>Content</h1>
        <p className="max-w-2xl text-muted-foreground">
          Everything below is read from <code>#content</code> (Velite output). Projects are already
          sorted: featured first, then order, then newest.
        </p>
      </header>

      <Section title="Site config" count={Object.keys(siteConfig).length}>
        <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs">
          {JSON.stringify(siteConfig, null, 2)}
        </pre>
      </Section>

      <Section title="Projects" count={projects.length}>
        <ul className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="flex flex-col overflow-hidden rounded-lg border bg-card"
            >
              <Image
                src={project.thumbnail.src}
                alt={project.thumbnail.alt}
                className="aspect-[8/5] w-full object-cover"
              />
              <div className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag>{project.type}</Tag>
                  {project.featured && <Tag>featured</Tag>}
                  <Tag>{project.slug}</Tag>
                  <Tag>{project.date.slice(0, 10)}</Tag>
                </div>
                <h3>{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.pitch}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {project.stack.join(" · ")} · {project.features.length} features ·{" "}
                  {project.screenshots.length} screenshots · {project.results.length} results ·
                  video {project.video ? "yes" : "no"} · raw {project.raw.length} chars
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Skills" count={skills.length}>
        <ul className="grid gap-4 md:grid-cols-2">
          {skills.map((group) => (
            <li key={group.name} className="rounded-lg border bg-card p-4">
              <h3>{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Experience" count={experience.length}>
        <ul className="flex flex-col gap-4">
          {experience.map((job) => (
            <li key={job.company + job.start} className="rounded-lg border bg-card p-4">
              <h3>
                {job.role} · {job.company}
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                {job.start} – {job.end ?? "present"} · {job.location}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Education" count={education.length}>
        <ul className="flex flex-col gap-4">
          {education.map((item) => (
            <li key={item.school} className="rounded-lg border bg-card p-4">
              <h3>
                {item.degree} {item.field} · {item.school}
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                {item.start} – {item.end ?? "present"}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Videos" count={videos.length}>
        <ul className="flex flex-col gap-2 text-sm">
          {videos.map((video) => (
            <li key={video.id}>
              {video.title}{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {video.provider}/{video.id} · {video.duration}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Writing" count={posts.length}>
        <ul className="flex flex-col gap-2 text-sm">
          {posts.map((post) => (
            <li key={post.slug}>
              {post.title}{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {post.permalink} · {post.metadata.readingTime} min ·{" "}
                {post.draft ? "draft" : "published"}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Socials" count={socials.length}>
        <ul className="flex flex-col gap-2 text-sm">
          {socials.map((social) => (
            <li key={social.kind}>
              {social.label}{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {social.handle} · {social.url}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
