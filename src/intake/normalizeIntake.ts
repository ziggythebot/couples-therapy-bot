import type { IntakeArtifact } from "../domain/types.js";

export interface NormalizedTurn {
  ts?: string;
  speaker: "agent" | "partner" | "unknown";
  role: "interviewer" | "interviewee";
  text: string;
  phase?: string;
  wordCount: number;
}

export interface NormalizedIntake {
  session_id: string;
  partner_id: string;
  source: string;
  started_at: string;
  turns: NormalizedTurn[];
  stats: {
    totalTurns: number;
    partnerTurns: number;
    agentTurns: number;
    avgPartnerWordsPerTurn: number;
    phases: string[];
  };
}

const AGENT_SPEAKERS = new Set(["agent", "interviewer", "assistant", "ai", "bot"]);

function classifySpeaker(speaker: string): NormalizedTurn["speaker"] {
  const s = speaker.toLowerCase().trim();
  if (AGENT_SPEAKERS.has(s)) return "agent";
  if (s.startsWith("partner")) return "partner";
  return "unknown";
}

export function normalizeIntake(artifact: IntakeArtifact): NormalizedIntake {
  const turns: NormalizedTurn[] = artifact.turns.map((t) => {
    const speaker = classifySpeaker(t.speaker);
    return {
      ts: t.ts,
      speaker,
      role: speaker === "agent" ? "interviewer" : "interviewee",
      text: t.text.trim(),
      phase: t.phase,
      wordCount: t.text.trim().split(/\s+/).filter(Boolean).length,
    };
  });

  const partnerTurns = turns.filter((t) => t.speaker === "partner");
  const agentTurns = turns.filter((t) => t.speaker === "agent");
  const phases = [...new Set(turns.map((t) => t.phase).filter(Boolean))] as string[];
  const avgWords =
    partnerTurns.length > 0
      ? partnerTurns.reduce((sum, t) => sum + t.wordCount, 0) / partnerTurns.length
      : 0;

  return {
    session_id: artifact.session_id,
    partner_id: artifact.partner_id,
    source: artifact.source,
    started_at: artifact.started_at,
    turns,
    stats: {
      totalTurns: turns.length,
      partnerTurns: partnerTurns.length,
      agentTurns: agentTurns.length,
      avgPartnerWordsPerTurn: Math.round(avgWords * 10) / 10,
      phases,
    },
  };
}
