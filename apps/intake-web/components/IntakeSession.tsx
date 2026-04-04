"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  LiveKitRoom,
  VideoTrack,
  useRemoteParticipants,
  useTracks,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, ConnectionState } from "livekit-client";

interface IntakeSessionProps {
  token: string;
  wsUrl: string;
  sessionId: string;
  onEnd: () => void;
}

export default function IntakeSession({ token, wsUrl, sessionId, onEnd }: IntakeSessionProps) {
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
      video={false}
      audio={true}
      className="min-h-screen bg-stone-900 flex flex-col"
    >
      <RoomAudioRenderer />
      <SessionView onEnd={endSession} ending={ending} />
    </LiveKitRoom>
  );
}

function useElapsedTime() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function MicButton() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const toggle = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  return (
    <button
      onClick={toggle}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
        isMicrophoneEnabled
          ? "bg-stone-700 hover:bg-stone-600"
          : "bg-red-600 hover:bg-red-700"
      }`}
      title={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
    >
      {isMicrophoneEnabled ? (
        <MicIcon className="w-5 h-5 text-white" />
      ) : (
        <MicOffIcon className="w-5 h-5 text-white" />
      )}
    </button>
  );
}

function ConnectionBadge() {
  const state = useConnectionState();
  const labels: Record<string, { label: string; color: string }> = {
    [ConnectionState.Connecting]: { label: "Connecting…", color: "bg-yellow-500" },
    [ConnectionState.Connected]: { label: "Live", color: "bg-green-500" },
    [ConnectionState.Reconnecting]: { label: "Reconnecting…", color: "bg-yellow-500" },
    [ConnectionState.Disconnected]: { label: "Disconnected", color: "bg-red-500" },
  };
  const { label, color } = labels[state] ?? { label: state, color: "bg-stone-500" };

  return (
    <span className="flex items-center gap-1.5 text-xs text-stone-400">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function SessionView({ onEnd, ending }: { onEnd: () => void; ending: boolean }) {
  const remoteParticipants = useRemoteParticipants();
  const avatarParticipant = remoteParticipants[0] ?? null;
  const elapsed = useElapsedTime();

  const avatarTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { participant: avatarParticipant ?? undefined }
  );
  const avatarVideoTrack = avatarTracks[0] ?? null;

  const agentConnected = remoteParticipants.length > 0;

  return (
    <div className="flex flex-col flex-1 items-center justify-between p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <ConnectionBadge />
        <span className="text-stone-400 text-sm font-mono">{elapsed}</span>
      </div>

      {/* Avatar video */}
      <div className="flex-1 flex items-center justify-center w-full">
        {avatarVideoTrack ? (
          <VideoTrack
            trackRef={avatarVideoTrack}
            className="rounded-2xl w-full aspect-video object-cover shadow-lg"
          />
        ) : (
          <div className="rounded-2xl w-full aspect-video bg-stone-800 flex flex-col items-center justify-center gap-3">
            {!agentConnected ? (
              <>
                <PulsingDot />
                <p className="text-stone-400 text-sm">Waiting for interviewer…</p>
              </>
            ) : (
              <>
                <PulsingDot />
                <p className="text-stone-400 text-sm">Connecting video…</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-4">
        <MicButton />
        <button
          onClick={onEnd}
          disabled={ending}
          className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {ending ? "Ending…" : "End Session"}
        </button>
      </div>
    </div>
  );
}

function PulsingDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-stone-500" />
    </span>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function MicOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" />
    </svg>
  );
}
