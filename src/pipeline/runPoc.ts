#!/usr/bin/env node
/**
 * Couples Bot — Analysis Pipeline
 *
 * Usage:
 *   npm run poc -- --intakeA <file> --intakeB <file> --chat <file>
 *   npm run poc -- --chat <file>   (chat-only, no intakes)
 */

import { parseArgs } from "node:util";
import { join } from "node:path";
import { env } from "../config/env.js";
import { ingestTranscript } from "../intake/ingestTranscript.js";
import { parseWhatsapp } from "../whatsapp/parseWhatsapp.js";
import { computeMetrics } from "../whatsapp/metrics.js";
import { riskScan } from "../safety/riskScan.js";
import { buildBriefPrompt } from "../synthesis/buildPrompt.js";
import { generateBrief } from "../synthesis/generateBrief.js";
import { writeJson, writeText } from "../io/readWrite.js";

const { values } = parseArgs({
  options: {
    intakeA: { type: "string" },
    intakeB: { type: "string" },
    chat: { type: "string" },
    partnerAName: { type: "string", default: "Partner A" },
    partnerBName: { type: "string", default: "Partner B" },
    out: { type: "string", default: env.memoryRoot },
  },
  strict: false,
});

async function run() {
  console.log("🔍 Running analysis pipeline...\n");

  // 1. Ingest intakes
  const intakeA = values.intakeA
    ? await ingestTranscript(values.intakeA as string, "partner-a")
    : null;
  const intakeB = values.intakeB
    ? await ingestTranscript(values.intakeB as string, "partner-b")
    : null;
  if (intakeA) console.log(`✓ Intake A loaded (${intakeA.turns.length} turns)`);
  if (intakeB) console.log(`✓ Intake B loaded (${intakeB.turns.length} turns)`);

  // 2. Parse WhatsApp
  const messages = values.chat
    ? await parseWhatsapp(values.chat as string)
    : [];
  if (messages.length) console.log(`✓ Chat parsed (${messages.length} messages)`);

  // 3. Compute metrics
  const metrics = messages.length
    ? computeMetrics(messages, values.partnerAName as string, values.partnerBName as string)
    : null;
  if (metrics) console.log("✓ Metrics computed");

  // 4. Risk scan
  const risk = riskScan(
    [intakeA, intakeB].filter(Boolean) as NonNullable<typeof intakeA>[],
    messages
  );
  const outDir = values.out as string;
  await writeJson(join(outDir, "relationship", "risk-report.json"), risk);
  if (risk.flagged) {
    console.warn(`\n⚠️  RISK SIGNALS DETECTED (level: ${risk.level})`);
    for (const s of risk.signals) {
      console.warn(`   [${s.category}] ${s.source}: ${s.text.slice(0, 80)}`);
    }
    if (risk.level === "high") {
      console.error("\n🚨 High-risk signals found. Brief generation skipped. Review manually.\n");
      process.exit(1);
    }
    console.warn("\nContinuing with brief generation (non-high risk).\n");
  } else {
    console.log("✓ Risk scan clean");
  }

  // 5. Save metrics
  if (metrics) {
    await writeJson(join(outDir, "relationship", "chat-analysis.json"), { metrics, messageCount: messages.length });
    console.log("✓ Chat analysis saved");
  }

  // 6. Generate brief
  console.log("\n⏳ Generating relationship brief (LLM)...");
  const prompt = buildBriefPrompt(intakeA, intakeB, metrics, messages);
  const brief = await generateBrief(prompt);
  await writeText(join(outDir, "relationship", "relationship-brief.md"), brief);
  console.log(`\n✅ Brief written to ${join(outDir, "relationship", "relationship-brief.md")}`);
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
