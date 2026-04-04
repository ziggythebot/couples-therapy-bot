/**
 * Ingress Processor
 *
 * Receives LiveKit webhooks, identifies completed intake sessions,
 * and triggers the analysis pipeline.
 *
 * Webhook events handled:
 *   room_finished  → session ended, run analysis pipeline
 *   egress_ended   → recording available, log the ref
 */

import express from "express";
import { WebhookReceiver } from "livekit-server-sdk";
import { spawn } from "node:child_process";
import { resolve, join } from "node:path";

const PORT = Number(process.env.INGRESS_PORT ?? 3002);
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "";
const MEMORY_ROOT = process.env.MEMORY_ROOT ?? resolve("../../memory");
const REPO_ROOT = resolve("../../");

const receiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
const app = express();

// Raw body needed for LiveKit webhook signature verification
app.use("/webhook/livekit", express.raw({ type: "application/webhook+json" }));

app.post("/webhook/livekit", async (req, res) => {
  let event;
  try {
    event = await receiver.receive(req.body.toString(), req.headers["authorization"] as string);
  } catch {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  res.json({ ok: true });

  // Handle asynchronously — don't block the webhook response
  handleEvent(event).catch((err) =>
    console.error("[ingress] event handler failed:", err)
  );
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`ingress-processor listening on :${PORT}`));

// ─── Event handlers ──────────────────────────────────────────────────────────

async function handleEvent(event: Awaited<ReturnType<typeof receiver.receive>>) {
  const eventName = event.event;

  if (eventName === "room_finished") {
    const roomName = event.room?.name ?? "";
    if (!roomName.startsWith("intake-")) return; // ignore non-intake rooms

    const parts = roomName.split("-");
    const coupleId = parts[1];
    const partnerId = parts[2];

    console.log(`[ingress] room_finished: ${roomName} — triggering pipeline`);
    await runPipeline({ coupleId, partnerId, roomName });
  }

  if (eventName === "egress_ended") {
    const egressId = event.egressInfo?.egressId ?? "";
    const file = (event.egressInfo as any)?.fileResults?.[0]?.filename ?? "";
    console.log(`[ingress] egress_ended: ${egressId} → ${file}`);
    // Future: write recording ref to intake-index.json
  }
}

// ─── Pipeline trigger ─────────────────────────────────────────────────────────

interface PipelineArgs {
  coupleId: string;
  partnerId: string;
  roomName: string;
}

function runPipeline({ coupleId, partnerId, roomName }: PipelineArgs): Promise<void> {
  return new Promise((resolve, reject) => {
    // Locate the transcript the agent already wrote
    const sessionId = roomName.split("-").at(-1) ?? "unknown";
    const transcriptPath = join(MEMORY_ROOT, partnerId, `${sessionId}.json`);

    const args = [
      "run", "poc", "--",
      `--intakeA`, transcriptPath,
      `--out`, MEMORY_ROOT,
    ];

    const proc = spawn("npm", args, {
      cwd: REPO_ROOT,
      env: { ...process.env },
      stdio: "inherit",
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`[ingress] pipeline complete for ${roomName}`);
        resolve();
      } else {
        reject(new Error(`Pipeline exited with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}
