import type { WhatsappMessage, RelationshipMetrics } from "../domain/types.js";

const CONFLICT_PATTERNS = [
  /\b(stop|shut up|leave me alone|always|never|you never|you always|hate|fed up|done with)\b/i,
  /!{2,}/, // multiple exclamation marks
];

const REPAIR_PATTERNS = [
  /\b(sorry|i apologise|my fault|forgive|love you|miss you|can we talk|you're right)\b/i,
  /❤|💙|😘|🙏/,
];

const SILENCE_THRESHOLD_HOURS = 12;

export function computeMetrics(
  messages: WhatsappMessage[],
  partnerAName: string,
  partnerBName: string
): RelationshipMetrics {
  const nonSystem = messages.filter((m) => !m.isSystem);

  // Message balance
  const aCount = nonSystem.filter((m) => m.sender === partnerAName).length;
  const bCount = nonSystem.filter((m) => m.sender === partnerBName).length;

  // Initiation rate — who sends first after a silence gap
  let aInitiations = 0;
  let bInitiations = 0;
  for (let i = 1; i < nonSystem.length; i++) {
    const prev = new Date(nonSystem[i - 1].timestamp).getTime();
    const curr = new Date(nonSystem[i].timestamp).getTime();
    if ((curr - prev) > SILENCE_THRESHOLD_HOURS * 3600_000) {
      if (nonSystem[i].sender === partnerAName) aInitiations++;
      else if (nonSystem[i].sender === partnerBName) bInitiations++;
    }
  }
  const totalInitiations = aInitiations + bInitiations || 1;

  // Response latency — time from A message to next B message and vice versa
  const aToB: number[] = [];
  const bToA: number[] = [];
  for (let i = 1; i < nonSystem.length; i++) {
    const prev = nonSystem[i - 1];
    const curr = nonSystem[i];
    const gap = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 60_000;
    if (prev.sender === partnerAName && curr.sender === partnerBName) aToB.push(gap);
    if (prev.sender === partnerBName && curr.sender === partnerAName) bToA.push(gap);
  }
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  // Silence gaps
  const silenceGaps = [];
  for (let i = 1; i < nonSystem.length; i++) {
    const prev = new Date(nonSystem[i - 1].timestamp);
    const curr = new Date(nonSystem[i].timestamp);
    const hours = (curr.getTime() - prev.getTime()) / 3600_000;
    if (hours >= SILENCE_THRESHOLD_HOURS) {
      silenceGaps.push({ start: prev.toISOString(), end: curr.toISOString(), hours: Math.round(hours * 10) / 10 });
    }
  }

  // Conflict + repair signals
  const conflictSignals = nonSystem
    .filter((m) => CONFLICT_PATTERNS.some((p) => p.test(m.text)))
    .map((m) => ({ timestamp: m.timestamp, sender: m.sender, signal: m.text.slice(0, 120) }));

  const repairSignals = nonSystem
    .filter((m) => REPAIR_PATTERNS.some((p) => p.test(m.text)))
    .map((m) => ({ timestamp: m.timestamp, sender: m.sender, signal: m.text.slice(0, 120) }));

  return {
    messageBalance: { partnerA: aCount, partnerB: bCount },
    initiationRate: {
      partnerA: Math.round((aInitiations / totalInitiations) * 100) / 100,
      partnerB: Math.round((bInitiations / totalInitiations) * 100) / 100,
    },
    responseLatencyMinutes: {
      partnerAAvg: Math.round(avg(bToA) * 10) / 10,
      partnerBAvg: Math.round(avg(aToB) * 10) / 10,
    },
    silenceGaps,
    conflictSignals,
    repairSignals,
  };
}
