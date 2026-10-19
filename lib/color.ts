export type Rgba = { r: number; g: number; b: number; a: number };

/**
 * Parses a computed CSS color: `rgb()`/`rgba()` (0–255 channels) or
 * `color(srgb r g b / a)` (0–1 channels, what browsers return for color-mix).
 */
export function parseCssColor(value: string): Rgba | null {
  const rgb = value.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/,
  );
  if (rgb) {
    const [, r, g, b, a] = rgb;
    return { r: Number(r), g: Number(g), b: Number(b), a: a === undefined ? 1 : Number(a) };
  }
  const srgb = value.match(
    /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/,
  );
  if (srgb) {
    const [, r, g, b, a] = srgb;
    return {
      r: Number(r) * 255,
      g: Number(g) * 255,
      b: Number(b) * 255,
      a: a === undefined ? 1 : Number(a),
    };
  }
  return null;
}

/** Composites a possibly translucent color over an opaque backdrop. */
export function flatten(color: Rgba, backdrop: Rgba): Rgba {
  const mix = (c: number, d: number) => c * color.a + d * (1 - color.a);
  return {
    r: mix(color.r, backdrop.r),
    g: mix(color.g, backdrop.g),
    b: mix(color.b, backdrop.b),
    a: 1,
  };
}

function relativeLuminance({ r, g, b }: Rgba): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.x contrast ratio between two opaque colors (1–21). */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

export function toHex({ r, g, b }: Rgba): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}
