export type PartnerId = "partner-a" | "partner-b";

export interface IntakeArtifact {
  session_id: string;
  partner_id: PartnerId;
  source: "livekit-agent" | "text";
  started_at: string;
  turns: Array<{ ts?: string; speaker: string; text: string; phase?: string }>;
}

export interface WhatsappMessage {
  timestamp: string; // ISO
  sender: string;
  text: string;
  isSystem: boolean;
}

export interface RelationshipMetrics {
  messageBalance: { partnerA: number; partnerB: number };
  initiationRate: { partnerA: number; partnerB: number };
  responseLatencyMinutes: { partnerAAvg: number; partnerBAvg: number };
  silenceGaps: Array<{ start: string; end: string; hours: number }>;
  conflictSignals: Array<{ timestamp: string; sender: string; signal: string }>;
  repairSignals: Array<{ timestamp: string; sender: string; signal: string }>;
}

export interface RiskReport {
  flagged: boolean;
  level: "none" | "low" | "medium" | "high";
  signals: Array<{ source: string; text: string; category: string }>;
  checkedAt: string;
}
