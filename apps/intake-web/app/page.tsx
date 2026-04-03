"use client";

import { useState } from "react";
import IntakeSession from "@/components/IntakeSession";

interface SessionData {
  session_id: string;
  room_name: string;
  token: string;
  ws_url: string;
}

export default function Home() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSession() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/intake/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couple_id: "cpl_demo",
          partner_id: "partner-a",
          intake_version: "v1",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSession(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      setLoading(false);
    }
  }

  if (session) {
    return (
      <IntakeSession
        token={session.token}
        wsUrl={session.ws_url}
        sessionId={session.session_id}
        onEnd={() => setSession(null)}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-stone-100 text-center space-y-6">
        <h1 className="text-2xl font-semibold text-stone-800">
          Intake Interview
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          You&apos;ll speak with an AI interviewer about your relationship.
          Everything you share is confidential.
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={startSession}
          disabled={loading}
          className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Starting…" : "Begin Intake"}
        </button>
      </div>
    </main>
  );
}
