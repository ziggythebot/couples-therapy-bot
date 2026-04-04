import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { riskScan } from "../safety/riskScan.js";
import type { IntakeArtifact, WhatsappMessage } from "../domain/types.js";

function intake(text: string): IntakeArtifact {
  return {
    session_id: "test",
    partner_id: "partner-a",
    source: "text",
    started_at: new Date().toISOString(),
    turns: [{ speaker: "partner", text }],
  };
}

function chatMsg(text: string): WhatsappMessage {
  return { sender: "Alex", text, timestamp: new Date().toISOString(), isSystem: false };
}

describe("riskScan", () => {
  it("returns none for clean input", () => {
    const r = riskScan([intake("We've been arguing a bit lately")], []);
    assert.equal(r.level, "none");
    assert.equal(r.flagged, false);
  });

  it("flags high risk for violence language", () => {
    const r = riskScan([intake("I feel like I want to hurt myself")], []);
    assert.equal(r.level, "high");
    assert.equal(r.flagged, true);
  });

  it("flags medium risk for distress language", () => {
    const r = riskScan([intake("I feel completely hopeless and trapped")], []);
    assert.ok(["medium", "high"].includes(r.level));
    assert.equal(r.flagged, true);
  });

  it("flags low risk for substance use", () => {
    const r = riskScan([], [chatMsg("Been drinking too much lately")]);
    assert.ok(r.flagged);
    assert.ok(["low", "medium", "high"].includes(r.level));
  });

  it("includes signal source in report", () => {
    const r = riskScan([intake("I want to kill this situation")], []);
    assert.ok(r.signals.length > 0);
    assert.ok(r.signals[0].source.includes("intake"));
  });

  it("includes checkedAt timestamp", () => {
    const r = riskScan([], []);
    assert.ok(r.checkedAt);
    assert.doesNotThrow(() => new Date(r.checkedAt));
  });
});
