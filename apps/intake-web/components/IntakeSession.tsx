"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  VideoTrack,
  useRemoteParticipants,
  useTracks,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

interface IntakeSessionProps {
  token: string;
  wsUrl: string;
  sessionId: string;
  onEnd: () => void;
}

export default function IntakeSession({
  token,
  wsUrl,
  sessionId,
  onEnd,
}: IntakeSessionProps) {
  const [ending, setEnding] = useState(false);

  async function endSession() {
    setEnding(true);
    try {
      await fetch(`/api/intake/session/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "completed" }),
      });
    } finally {
      onEnd();
    }
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      video={true}
      audio={true}
      className="min-h-screen bg-stone-900 flex flex-col"
    >
      <RoomAudioRenderer />
      <SessionView onEnd={endSession} ending={ending} />
    </LiveKitRoom>
  );
}

function SessionView({
  onEnd,
  ending,
}: {
  onEnd: () => void;
  ending: boolean;
}) {
  const remoteParticipants = useRemoteParticipants();
  const avatarParticipant = remoteParticipants[0] ?? null;

  const avatarTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { participant: avatarParticipant ?? undefined }
  );
  const avatarVideoTrack = avatarTracks[0] ?? null;

  return (
    <div className="flex flex-col flex-1 items-center justify-between p-6">
      {/* Avatar video */}
      <div className="flex-1 flex items-center justify-center w-full max-w-2xl">
        {avatarVideoTrack ? (
          <VideoTrack
            trackRef={avatarVideoTrack}
            className="rounded-2xl w-full aspect-video object-cover"
          />
        ) : (
          <div className="rounded-2xl w-full aspect-video bg-stone-800 flex items-center justify-center">
            <p className="text-stone-400 text-sm">
              {remoteParticipants.length === 0
                ? "Waiting for interviewer…"
                : "Connecting video…"}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={onEnd}
          disabled={ending}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {ending ? "Ending…" : "End Session"}
        </button>
      </div>
    </div>
  );
}
