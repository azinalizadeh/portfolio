import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  // `pnpm dev` and `pnpm build` run `velite build --strict` first, so content
  // is validated before Next starts. In dev, also watch content/ and rebuild
  // on change. Velite's webpack plugin doesn't apply under Turbopack, so it
  // starts here instead. The env flag stops a second watcher when Next loads
  // this file again (worker processes, config reloads).
  if (phase === PHASE_DEVELOPMENT_SERVER && !process.env.VELITE_STARTED) {
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    // Not strict: a typo while editing shouldn't kill the dev server; Velite
    // logs the issue and keeps watching.
    await build({ watch: true, strict: false, clean: false });
  }
  return nextConfig;
}
