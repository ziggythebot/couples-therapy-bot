import { Router } from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { nanoid } from "nanoid";
import { z } from "zod";
import { config } from "../config.js";
import { createSession, endSession } from "../sessions.js";

export const intakeRouter = Router();

const CreateSessionBody = z.object({
  couple_id: z.string().min(1),
  partner_id: z.enum(["partner-a", "partner-b"]),
  intake_version: z.string().default("v1"),
});

intakeRouter.post("/session", async (req, res) => {
  const parse = CreateSessionBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.flatten() });
    return;
  }

  const { couple_id, partner_id } = parse.data;
  const sessionId = `ses_${nanoid(10)}`;
  const roomName = `intake-${couple_id}-${partner_id}-${sessionId}`;

  // Create the LiveKit room
  const roomService = new RoomServiceClient(
    config.livekit.url,
    config.livekit.apiKey,
    config.livekit.apiSecret
  );

  await roomService.createRoom({
    name: roomName,
    emptyTimeout: 300, // close room after 5 min empty
    maxParticipants: 3, // partner + agent + avatar
  });

  // Mint a short-lived participant token
  const at = new AccessToken(
    config.livekit.apiKey,
    config.livekit.apiSecret,
    {
      identity: partner_id,
      ttl: config.sessionTokenTtlSeconds,
    }
  );
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();
  const joinExpiresAt = new Date(
    Date.now() + config.sessionTokenTtlSeconds * 1000
  ).toISOString();

  createSession({
    sessionId,
    roomName,
    coupleId: couple_id,
    partnerId: partner_id,
    createdAt: new Date().toISOString(),
    recordingStatus: "pending",
    transcriptStatus: "pending",
  });

  res.json({
    session_id: sessionId,
    room_name: roomName,
    token,
    ws_url: config.livekit.url,
    join_expires_at: joinExpiresAt,
  });
});

intakeRouter.post("/session/:id/end", async (req, res) => {
  const session = endSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  // Delete the LiveKit room (non-fatal if already gone)
  try {
    const roomService = new RoomServiceClient(
      config.livekit.url,
      config.livekit.apiKey,
      config.livekit.apiSecret
    );
    await roomService.deleteRoom(session.roomName);
  } catch {
    // room may already be closed — that's fine
  }

  res.json({
    ok: true,
    recording_status: session.recordingStatus,
    transcript_status: session.transcriptStatus,
  });
});
