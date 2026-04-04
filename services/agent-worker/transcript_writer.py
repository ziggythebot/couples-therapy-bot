"""
Persists transcript turns to JSON and Markdown artifacts.
Called by the agent as the conversation progresses.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path


class TranscriptWriter:
    def __init__(self, session_id: str, partner_id: str, memory_root: str = "../../memory"):
        self.session_id = session_id
        self.partner_id = partner_id
        self.turns: list[dict] = []
        self.started_at = datetime.now(timezone.utc).isoformat()

        partner_dir = Path(memory_root) / partner_id
        partner_dir.mkdir(parents=True, exist_ok=True)
        self.json_path = partner_dir / f"{session_id}.json"
        self.md_path = partner_dir / f"{session_id}.md"

    def add_turn(self, speaker: str, text: str, phase: str | None = None) -> None:
        turn = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "speaker": speaker,
            "text": text,
        }
        if phase:
            turn["phase"] = phase
        self.turns.append(turn)
        self._flush()

    def _flush(self) -> None:
        artifact = {
            "session_id": self.session_id,
            "partner_id": self.partner_id,
            "source": "livekit-agent",
            "started_at": self.started_at,
            "turns": self.turns,
        }
        self.json_path.write_text(json.dumps(artifact, indent=2))

        lines = [
            f"# Intake Transcript — {self.partner_id} — {self.session_id}",
            f"_Started: {self.started_at}_\n",
        ]
        for t in self.turns:
            phase_tag = f" `[{t['phase']}]`" if "phase" in t else ""
            lines.append(f"**{t['speaker']}**{phase_tag}: {t['text']}\n")
        self.md_path.write_text("\n".join(lines))

    def finalize(self) -> dict:
        """Write final artifact, update intake index, and return summary metadata."""
        self._flush()
        self._update_intake_index()
        return {
            "session_id": self.session_id,
            "partner_id": self.partner_id,
            "turn_count": len(self.turns),
            "json_path": str(self.json_path),
            "md_path": str(self.md_path),
        }

    def _update_intake_index(self) -> None:
        """Upsert this session into memory/relationship/intake-index.json."""
        import json as _json

        index_path = Path(self.json_path.parent.parent) / "relationship" / "intake-index.json"
        index_path.parent.mkdir(parents=True, exist_ok=True)

        index: dict = {}
        if index_path.exists():
            try:
                index = _json.loads(index_path.read_text())
            except Exception:
                index = {}

        sessions: list = index.get("sessions", [])
        # Replace existing entry for this session or append
        sessions = [s for s in sessions if s.get("session_id") != self.session_id]
        sessions.append({
            "session_id": self.session_id,
            "partner_id": self.partner_id,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "turn_count": len(self.turns),
            "transcript_json": str(self.json_path),
            "transcript_md": str(self.md_path),
        })
        index["sessions"] = sessions
        index["last_updated"] = datetime.now(timezone.utc).isoformat()
        index_path.write_text(_json.dumps(index, indent=2))
