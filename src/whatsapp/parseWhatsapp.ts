import { readFile } from "node:fs/promises";
import type { WhatsappMessage } from "../domain/types.js";

// Matches: [DD/MM/YYYY, HH:MM:SS] or [M/D/YY, H:MM:SS AM/PM] etc.
const LINE_RE =
  /^\[?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?\s*[-–]?\s*([^:]+?):\s(.+)$/;

const SYSTEM_PHRASES = [
  "messages and calls are end-to-end encrypted",
  "changed the subject",
  "added",
  "left",
  "created group",
  "changed this group",
  "security code changed",
];

function parseTimestamp(date: string, time: string): string {
  // Normalise date separators and attempt ISO parse
  const normalised = `${date.replace(/[.\-]/g, "/")} ${time}`;
  const d = new Date(normalised);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function isSystem(text: string): boolean {
  return SYSTEM_PHRASES.some((p) => text.toLowerCase().includes(p));
}

export async function parseWhatsapp(filePath: string): Promise<WhatsappMessage[]> {
  const raw = await readFile(filePath, "utf8");
  const lines = raw.split("\n");
  const messages: WhatsappMessage[] = [];
  let current: WhatsappMessage | null = null;

  for (const line of lines) {
    const match = LINE_RE.exec(line.trim());
    if (match) {
      if (current) messages.push(current);
      const [, date, time, sender, text] = match;
      current = {
        timestamp: parseTimestamp(date, time),
        sender: sender.trim(),
        text: text.trim(),
        isSystem: isSystem(text),
      };
    } else if (current && line.trim()) {
      // Continuation of previous message (multiline)
      current.text += "\n" + line.trim();
    }
  }
  if (current) messages.push(current);

  return messages;
}
