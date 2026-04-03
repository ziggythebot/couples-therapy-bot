// In-memory session store (sufficient for PoC — swap for Redis/DB later)
export interface SessionRecord {
  sessionId: string;
  roomName: string;
  coupleId: string;
  partnerId: string;
  createdAt: string;
  endedAt?: string;
  recordingStatus: "pending" | "processing" | "done";
  transcriptStatus: "pending" | "available";
}

const store = new Map<string, SessionRecord>();

export function createSession(record: SessionRecord): void {
  store.set(record.sessionId, record);
}

export function getSession(sessionId: string): SessionRecord | undefined {
  return store.get(sessionId);
}

export function endSession(sessionId: string): SessionRecord | undefined {
  const session = store.get(sessionId);
  if (!session) return undefined;
  session.endedAt = new Date().toISOString();
  session.transcriptStatus = "available";
  session.recordingStatus = "processing";
  return session;
}
