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
        """Write final artifact and return summary metadata."""
        self._flush()
        return {
            "session_id": self.session_id,
            "partner_id": self.partner_id,
            "turn_count": len(self.turns),
            "json_path": str(self.json_path),
            "md_path": str(self.md_path),
        }
