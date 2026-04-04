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
import { normalizeIntake } from "../intake/normalizeIntake.js";
import { parseWhatsapp } from "../whatsapp/parseWhatsapp.js";
import { computeMetrics } from "../whatsapp/metrics.js";
import { detectThemes } from "../whatsapp/themes.js";
import { riskScan } from "../safety/riskScan.js";
import { resolveEscalation, formatEscalationNotice } from "../safety/escalation.js";
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
  const outDir = values.out as string;

  // 1. Ingest + normalize intakes
  const intakeARaw = values.intakeA
    ? await ingestTranscript(values.intakeA as string, "partner-a")
    : null;
  const intakeBRaw = values.intakeB
    ? await ingestTranscript(values.intakeB as string, "partner-b")
    : null;

  const intakeA = intakeARaw ? normalizeIntake(intakeARaw) : null;
  const intakeB = intakeBRaw ? normalizeIntake(intakeBRaw) : null;

  if (intakeA) console.log(`✓ Intake A (${intakeA.stats.partnerTurns} partner turns, avg ${intakeA.stats.avgPartnerWordsPerTurn} words/turn)`);
  if (intakeB) console.log(`✓ Intake B (${intakeB.stats.partnerTurns} partner turns, avg ${intakeB.stats.avgPartnerWordsPerTurn} words/turn)`);

  // 2. Parse WhatsApp
  const messages = values.chat
    ? await parseWhatsapp(values.chat as string)
    : [];
  if (messages.length) console.log(`✓ Chat parsed (${messages.length} messages)`);

  // 3. Compute metrics + themes
  const metrics = messages.length
    ? computeMetrics(messages, values.partnerAName as string, values.partnerBName as string)
    : null;
  const themes = messages.length ? detectThemes(messages) : [];
  if (metrics) console.log(`✓ Metrics computed (${themes.length} themes detected)`);

  // 4. Risk scan + escalation
  const rawIntakes = [intakeARaw, intakeBRaw].filter(Boolean) as NonNullable<typeof intakeARaw>[];
  const risk = riskScan(rawIntakes, messages);
  const escalation = resolveEscalation(risk);

  await writeJson(join(outDir, "relationship", "risk-report.json"), risk);

  if (risk.flagged) {
    const notice = formatEscalationNotice(risk, escalation, "pipeline-run");
    await writeText(join(outDir, "relationship", "escalation-notice.md"), notice);
    console.warn(`\n⚠️  Risk signals detected (level: ${risk.level}) — ${escalation.action}`);
  } else {
    console.log("✓ Risk scan clean");
  }

  if (escalation.pausePipeline) {
    console.error(`\n🚨 ${escalation.message}\n`);
    process.exit(1);
  }

  // 5. Save analysis artifacts
  if (metrics) {
    await writeJson(join(outDir, "relationship", "chat-analysis.json"), {
      metrics,
      themes,
      messageCount: messages.length,
    });
    console.log("✓ Chat analysis saved");
  }

  // 6. Generate brief
  // Convert normalized intakes back to raw shape for prompt builder
  console.log("\n⏳ Generating relationship brief (LLM)...");
  const prompt = buildBriefPrompt(intakeARaw, intakeBRaw, metrics, messages);
  const brief = await generateBrief(prompt);
  await writeText(join(outDir, "relationship", "relationship-brief.md"), brief);
  console.log(`\n✅ Brief written to ${join(outDir, "relationship", "relationship-brief.md")}`);
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
