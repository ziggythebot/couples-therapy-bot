import type { RiskReport } from "../domain/types.js";

export interface EscalationAction {
  action: "block" | "flag" | "log";
  message: string;
  notifyTherapist: boolean;
  pausePipeline: boolean;
}

/**
 * Determines what action to take given a risk report.
 * Returns the action without performing side effects — callers decide what to do.
 */
export function resolveEscalation(risk: RiskReport): EscalationAction {
  if (!risk.flagged || risk.level === "none") {
    return {
      action: "log",
      message: "No risk signals detected.",
      notifyTherapist: false,
      pausePipeline: false,
    };
  }

  if (risk.level === "high") {
    const categories = [...new Set(risk.signals.map((s) => s.category))].join(", ");
    return {
      action: "block",
      message: `High-risk signals detected (${categories}). Brief generation blocked. Manual therapist review required before proceeding.`,
      notifyTherapist: true,
      pausePipeline: true,
    };
  }

  if (risk.level === "medium") {
    const categories = [...new Set(risk.signals.map((s) => s.category))].join(", ");
    return {
      action: "flag",
      message: `Medium-risk signals detected (${categories}). Brief generated but flagged for therapist review.`,
      notifyTherapist: true,
      pausePipeline: false,
    };
  }

  // low
  return {
    action: "flag",
    message: `Low-risk signals noted (${risk.signals.map((s) => s.category).join(", ")}). Logged for awareness.`,
    notifyTherapist: false,
    pausePipeline: false,
  };
}

/**
 * Format a human-readable escalation notice for logging or notification.
 */
export function formatEscalationNotice(
  risk: RiskReport,
  action: EscalationAction,
  sessionId: string
): string {
  const lines = [
    `## Safety Escalation Notice`,
    `Session: ${sessionId}`,
    `Risk level: ${risk.level.toUpperCase()}`,
    `Action: ${action.action.toUpperCase()}`,
    ``,
    action.message,
    ``,
  ];

  if (risk.signals.length > 0) {
    lines.push("### Signals detected:");
    for (const s of risk.signals) {
      lines.push(`- [${s.category}] ${s.source}: "${s.text.slice(0, 120)}"`);
    }
  }

  lines.push(``, `Checked at: ${risk.checkedAt}`);
  return lines.join("\n");
}
