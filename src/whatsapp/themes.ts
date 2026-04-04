import type { WhatsappMessage } from "../domain/types.js";

export interface ThemeResult {
  theme: string;
  count: number;
  examples: string[];
  senders: Record<string, number>;
}

const THEME_PATTERNS: Array<{ theme: string; patterns: RegExp[] }> = [
  {
    theme: "Quality time",
    patterns: [/\b(plans?|tonight|weekend|together|dinner|date|miss you|let's do|come over)\b/i],
  },
  {
    theme: "Communication breakdown",
    patterns: [/\b(you never|you always|stop|don't bother|left on read|ignored|no reply|ghosting)\b/i],
  },
  {
    theme: "Emotional support",
    patterns: [/\b(are you okay|how are you|here for you|support|tough day|stressed|overwhelmed)\b/i],
  },
  {
    theme: "Domestic / logistics",
    patterns: [/\b(dishes?|clean|laundry|shopping|groceries?|rent|bills?|flat|house|tidying)\b/i],
  },
  {
    theme: "Affection",
    patterns: [/\b(love you|miss you|❤|😘|💕|xo|hug|kiss|cute|beautiful|handsome)\b/i],
  },
  {
    theme: "Conflict",
    patterns: [/\b(argument|fight|argue|upset|angry|annoyed|frustrated|fed up|done with)\b/i],
  },
  {
    theme: "Future / plans",
    patterns: [/\b(future|someday|when we|one day|next year|move|travel|holiday|vacation|kids?|family)\b/i],
  },
  {
    theme: "Work / stress",
    patterns: [/\b(work|job|boss|meeting|deadline|tired|exhausted|long day|busy|office)\b/i],
  },
];

export function detectThemes(messages: WhatsappMessage[]): ThemeResult[] {
  const nonSystem = messages.filter((m) => !m.isSystem);
  const results: ThemeResult[] = [];

  for (const { theme, patterns } of THEME_PATTERNS) {
    const matched = nonSystem.filter((m) =>
      patterns.some((p) => p.test(m.text))
    );
    if (matched.length === 0) continue;

    const senders: Record<string, number> = {};
    for (const m of matched) {
      senders[m.sender] = (senders[m.sender] ?? 0) + 1;
    }

    results.push({
      theme,
      count: matched.length,
      examples: matched.slice(0, 3).map((m) => m.text.slice(0, 100)),
      senders,
    });
  }

  return results.sort((a, b) => b.count - a.count);
}
