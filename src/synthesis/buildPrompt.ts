import type { IntakeArtifact, RelationshipMetrics, WhatsappMessage } from "../domain/types.js";

export function buildBriefPrompt(
  intakeA: IntakeArtifact | null,
  intakeB: IntakeArtifact | null,
  metrics: RelationshipMetrics | null,
  recentMessages: WhatsappMessage[]
): string {
  const parts: string[] = [
    "You are an expert relationship analyst preparing a structured brief for a licensed couples therapist.",
    "Your job is to synthesise intake interview data and communication patterns into a clear, evidence-grounded brief.",
    "Do NOT diagnose, prescribe, or make clinical judgements. Report patterns, not conclusions.",
    "Label confidence (high / medium / low) for each finding based on evidence density.\n",
  ];

  if (intakeA) {
    parts.push("## Partner A Intake");
    parts.push(intakeA.turns.map((t) => `[${t.speaker}] ${t.text}`).join("\n"));
  }

  if (intakeB) {
    parts.push("\n## Partner B Intake");
    parts.push(intakeB.turns.map((t) => `[${t.speaker}] ${t.text}`).join("\n"));
  }

  if (metrics) {
    parts.push("\n## Communication Metrics (WhatsApp)");
    parts.push(JSON.stringify(metrics, null, 2));
  }

  if (recentMessages.length > 0) {
    const sample = recentMessages.slice(-40);
    parts.push("\n## Recent Messages (last 40)");
    parts.push(sample.map((m) => `[${m.timestamp.slice(0, 10)} ${m.sender}] ${m.text}`).join("\n"));
  }

  parts.push(`
## Required Output Format (markdown)

# Relationship Brief

## Presenting Concerns
- ...

## Relationship Strengths
- ...

## Communication Patterns
- ...

## Conflict & Repair Dynamics
- ...

## Key Themes
- ...

## Recommended Focus Areas for Therapist
- ...

_Generated: ${new Date().toISOString()}_
`);

  return parts.join("\n");
}
