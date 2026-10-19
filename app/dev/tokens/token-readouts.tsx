"use client";

import { useEffect, useRef, useState } from "react";
import { contrastRatio, flatten, parseCssColor, toHex, type Rgba } from "@/lib/color";

/** Resolves a CSS custom property to an opaque color by painting it on a probe element. */
function resolveToken(token: string, backdrop?: Rgba): Rgba | null {
  const probe = document.createElement("div");
  probe.style.backgroundColor = `var(${token})`;
  document.body.appendChild(probe);
  const color = parseCssColor(getComputedStyle(probe).backgroundColor);
  probe.remove();
  if (!color) return null;
  return color.a < 1 && backdrop ? flatten(color, backdrop) : color;
}

/** Shows the computed hex value of the background of its parent swatch. */
export function SwatchHex() {
  const ref = useRef<HTMLSpanElement>(null);
  const [hex, setHex] = useState("");

  useEffect(() => {
    const swatch = ref.current?.parentElement?.querySelector("[data-swatch]");
    if (!swatch) return;
    const color = parseCssColor(getComputedStyle(swatch).backgroundColor);
    if (color)
      setHex(color.a < 1 ? `${toHex(color)} @ ${Math.round(color.a * 100)}%` : toHex(color));
  }, []);

  return (
    <span ref={ref} className="font-mono text-xs text-muted-foreground">
      {hex || " "}
    </span>
  );
}

export type ContrastPair = {
  fg: string;
  bg: string;
  /** Minimum ratio: 4.5 for text, 3 for focus rings and component boundaries. */
  min: number;
  note?: string;
  /** Documents a pair that must stay below `min` (e.g. a color banned for text). */
  expectFail?: boolean;
};

type Row = ContrastPair & { ratio: number | null };

export function ContrastTable({ pairs }: { pairs: ContrastPair[] }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    // Measure after the browser has painted with the final stylesheet.
    const frame = requestAnimationFrame(() => {
      const page = resolveToken("--background");
      setRows(
        pairs.map((pair) => {
          const bg = page && resolveToken(pair.bg, page);
          const fg = bg && resolveToken(pair.fg, bg);
          return { ...pair, ratio: bg && fg ? contrastRatio(fg, bg) : null };
        }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [pairs]);

  const meetsExpectation = (row: Row) =>
    row.ratio !== null && row.ratio >= row.min !== Boolean(row.expectFail);
  const failures = rows.filter((row) => !meetsExpectation(row)).length;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground" data-testid="contrast-summary">
        {rows.length === 0
          ? "Measuring…"
          : failures === 0
            ? `All ${rows.length} pairs pass.`
            : `${failures} of ${rows.length} pairs fail.`}
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Sample</th>
              <th className="px-4 py-2 font-medium">Foreground / background</th>
              <th className="px-4 py-2 font-medium">Ratio</th>
              <th className="px-4 py-2 font-medium">Needs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pass = meetsExpectation(row);
              return (
                <tr key={`${row.fg}-${row.bg}`} className="border-t">
                  <td className="px-4 py-2">
                    <span
                      className="inline-block rounded-sm px-2 py-1"
                      style={{ color: `var(${row.fg})`, backgroundColor: `var(${row.bg})` }}
                    >
                      Aa
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {row.fg} / {row.bg}
                    {row.note && (
                      <span className="block font-sans text-muted-foreground">{row.note}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{row.ratio?.toFixed(2) ?? "?"}:1</td>
                  <td
                    className={`px-4 py-2 font-mono text-xs ${pass ? "text-success" : "text-destructive"}`}
                  >
                    {pass ? "✓" : "✗"} {row.expectFail ? `< ${row.min}` : row.min}:1
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
