import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeMetrics } from "../whatsapp/metrics.js";
import type { WhatsappMessage } from "../domain/types.js";

function msg(sender: string, text: string, minutesOffset: number): WhatsappMessage {
  const base = new Date("2026-01-01T09:00:00Z");
  base.setMinutes(base.getMinutes() + minutesOffset);
  return { sender, text, timestamp: base.toISOString(), isSystem: false };
}

describe("computeMetrics", () => {
  it("counts message balance correctly", () => {
    const messages = [
      msg("Alex", "hi", 0),
      msg("Alex", "hey", 1),
      msg("Jordan", "hello", 2),
    ];
    const m = computeMetrics(messages, "Alex", "Jordan");
    assert.equal(m.messageBalance.partnerA, 2);
    assert.equal(m.messageBalance.partnerB, 1);
  });

  it("detects conflict signals", () => {
    const messages = [
      msg("Alex", "you always do this!!", 0),
      msg("Jordan", "I never said that", 1),
    ];
    const m = computeMetrics(messages, "Alex", "Jordan");
    assert.ok(m.conflictSignals.length >= 1);
  });

  it("detects repair signals", () => {
    const messages = [
      msg("Alex", "I'm sorry, love you", 0),
      msg("Jordan", "you're right, my fault", 1),
    ];
    const m = computeMetrics(messages, "Alex", "Jordan");
    assert.ok(m.repairSignals.length >= 2);
  });

  it("detects silence gaps over 12 hours", () => {
    const messages = [
      msg("Alex", "morning", 0),
      msg("Jordan", "hey", 13 * 60), // 13 hours later
    ];
    const m = computeMetrics(messages, "Alex", "Jordan");
    assert.equal(m.silenceGaps.length, 1);
    assert.ok(m.silenceGaps[0].hours >= 13);
  });

  it("does not flag gaps under 12 hours as silence", () => {
    const messages = [
      msg("Alex", "morning", 0),
      msg("Jordan", "hey", 60), // 1 hour later
    ];
    const m = computeMetrics(messages, "Alex", "Jordan");
    assert.equal(m.silenceGaps.length, 0);
  });

  it("computes initiation rate", () => {
    const messages = [
      msg("Alex", "hey", 0),
      msg("Jordan", "hey back", 1),
      // 13-hour gap — Alex initiates
      msg("Alex", "morning!", 13 * 60),
      msg("Jordan", "morning", 13 * 60 + 5),
    ];
    const m = computeMetrics(messages, "Alex", "Jordan");
    assert.ok(m.initiationRate.partnerA > 0);
  });

  it("handles empty message list", () => {
    const m = computeMetrics([], "Alex", "Jordan");
    assert.equal(m.messageBalance.partnerA, 0);
    assert.equal(m.messageBalance.partnerB, 0);
    assert.equal(m.silenceGaps.length, 0);
    assert.equal(m.conflictSignals.length, 0);
  });
});
