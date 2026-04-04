import { readJson } from "../io/readWrite.js";
import type { IntakeArtifact, PartnerId } from "../domain/types.js";
import { readFile } from "node:fs/promises";

/** Load an intake artifact from a JSON file (agent-produced) or plain text. */
export async function ingestTranscript(
  filePath: string,
  partnerId: PartnerId
): Promise<IntakeArtifact> {
  if (filePath.endsWith(".json")) {
    return readJson<IntakeArtifact>(filePath);
  }

  // Plain text: treat entire file as a single partner turn
  const text = await readFile(filePath, "utf8");
  return {
    session_id: "imported",
    partner_id: partnerId,
    source: "text",
    started_at: new Date().toISOString(),
    turns: [{ speaker: partnerId, text: text.trim() }],
  };
}
