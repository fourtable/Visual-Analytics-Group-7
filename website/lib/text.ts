/**
 * Tiny inline syntax for strings in content/:
 *   [text]     → placeholder (unfilled team input, shown highlighted)
 *   **text**   → strong
 *   *text*     → emphasis
 * Anything else is plain text.
 */
export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "placeholder"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "em"; text: string };

const INLINE = /(\[[^\]]+\]|\*\*[^*]+\*\*|\*[^*]+\*)/g;

export function parseInline(source: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  for (const part of source.split(INLINE)) {
    if (!part) continue;
    if (part.startsWith("[") && part.endsWith("]"))
      tokens.push({ kind: "placeholder", text: part });
    else if (part.startsWith("**") && part.endsWith("**"))
      tokens.push({ kind: "strong", text: part.slice(2, -2) });
    else if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      tokens.push({ kind: "em", text: part.slice(1, -1) });
    else tokens.push({ kind: "text", text: part });
  }
  return tokens;
}

/** True when a content string still holds a [placeholder]. */
export function hasPlaceholder(source: string): boolean {
  return /\[[^\]]+\]/.test(source);
}

/** Fills {name} slots in a content template, e.g. fill("Chapter {n}", { n: 2 }). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
