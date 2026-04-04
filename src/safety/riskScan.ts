import type { IntakeArtifact, WhatsappMessage, RiskReport } from "../domain/types.js";

interface Signal {
  source: string;
  text: string;
  category: string;
}

const HIGH_RISK = [
  { pattern: /\b(kill|murder|suicide|end my life|hurt (you|myself|them))\b/i, category: "violence/self-harm" },
  { pattern: /\b(abuse|hit me|hits me|choke|threaten(ed|ing)?)\b/i, category: "abuse" },
];

const MEDIUM_RISK = [
  { pattern: /\b(can't go on|no point|hopeless|worthless|trapped)\b/i, category: "distress" },
  { pattern: /\b(affair|cheating|cheated|unfaithful)\b/i, category: "infidelity" },
];

const LOW_RISK = [
  { pattern: /\b(drinking|drunk|alcohol|substances?|drugs?)\b/i, category: "substance-use" },
];

function scanText(text: string, source: string): Signal[] {
  const signals: Signal[] = [];
  for (const { pattern, category } of HIGH_RISK) {
    if (pattern.test(text)) signals.push({ source, text: text.slice(0, 200), category });
  }
  for (const { pattern, category } of MEDIUM_RISK) {
    if (pattern.test(text)) signals.push({ source, text: text.slice(0, 200), category });
  }
  for (const { pattern, category } of LOW_RISK) {
    if (pattern.test(text)) signals.push({ source, text: text.slice(0, 200), category });
  }
  return signals;
}

export function riskScan(
  intakes: IntakeArtifact[],
  messages: WhatsappMessage[]
): RiskReport {
  const signals: Signal[] = [];

  for (const intake of intakes) {
    for (const turn of intake.turns) {
      signals.push(...scanText(turn.text, `intake:${intake.partner_id}:${turn.speaker}`));
    }
  }

  for (const msg of messages.filter((m) => !m.isSystem)) {
    signals.push(...scanText(msg.text, `whatsapp:${msg.sender}`));
  }

  const hasHigh = signals.some((s) =>
    HIGH_RISK.some((r) => r.category === s.category)
  );
  const hasMedium = signals.some((s) =>
    MEDIUM_RISK.some((r) => r.category === s.category)
  );

  return {
    flagged: signals.length > 0,
    level: hasHigh ? "high" : hasMedium ? "medium" : signals.length > 0 ? "low" : "none",
    signals,
    checkedAt: new Date().toISOString(),
  };
}
