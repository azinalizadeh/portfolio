"use client";

import { useState } from "react";
import { FilterChips } from "@/components/site/filter-chips";
import { SegmentedTabs, segmentedTabId } from "@/components/site/segmented-tabs";
import { SwapPanel } from "@/components/site/swap-panel";
import { useReducedMotion } from "@/lib/motion";

export type DemoProject = {
  slug: string;
  title: string;
  pitch: string;
  type: "work" | "side";
  stack: string[];
};

type Filter = "all" | "work" | "side";

export function MotionDemo({ projects }: { projects: DemoProject[] }) {
  const [type, setType] = useState<Filter>("all");
  const [tech, setTech] = useState<string[]>([]);
  const reduced = useReducedMotion();

  const allTech = [...new Set(projects.flatMap((project) => project.stack))].sort();
  const visible = projects.filter(
    (project) =>
      (type === "all" || project.type === type) &&
      tech.every((item) => project.stack.includes(item)),
  );
  const countOf = (filter: Filter) =>
    projects.filter((project) => filter === "all" || project.type === filter).length;

  return (
    <div className="flex flex-col gap-8">
      <p className="font-mono text-xs text-muted-foreground">
        prefers-reduced-motion: <span className="text-foreground">{String(reduced)}</span>
      </p>

      <div className="flex flex-col gap-4">
        <SegmentedTabs
          id="demo-type"
          aria-label="Project type"
          panelId="demo-panel"
          value={type}
          onValueChange={setType}
          options={[
            { value: "all", label: "All", count: countOf("all") },
            { value: "work", label: "Work", count: countOf("work") },
            { value: "side", label: "Side", count: countOf("side") },
          ]}
        />
        <FilterChips
          aria-label="Technology"
          options={allTech.map((item) => ({ value: item, label: item }))}
          value={tech}
          onValueChange={setTech}
        />
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {visible.length} of {projects.length} projects
          {tech.length > 0 && ` · ${tech.join(", ")}`}
        </p>
      </div>

      <SwapPanel
        id="demo-panel"
        role="tabpanel"
        aria-labelledby={segmentedTabId("demo-type", type)}
        swapKey={`${type}|${tech.join(",")}`}
        className="grid gap-4 md:grid-cols-2"
      >
        {visible.length > 0 ? (
          visible.map((project) => (
            <article
              key={project.slug}
              className="flex flex-col gap-2 rounded-lg border bg-card p-6"
            >
              <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                {project.type}
              </p>
              <h2 className="text-h3">{project.title}</h2>
              <p className="text-sm text-muted-foreground">{project.pitch}</p>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-muted-foreground md:col-span-2">
            No projects match these filters.
          </p>
        )}
      </SwapPanel>
    </div>
  );
}
