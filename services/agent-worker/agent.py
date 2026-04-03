"""
Couples Bot — Intake Interview Agent (livekit-agents 1.x)

Joins a LiveKit room via Tavus avatar, runs a 4-phase structured intake
interview, and persists the transcript on completion.

Run locally:
  python agent.py dev

Deploy:
  lk agent create ...
"""

import logging
import os

from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env")

from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import silero, tavus

from interview_phases import PHASES, SYSTEM_PROMPT
from transcript_writer import TranscriptWriter

logger = logging.getLogger("intake-agent")

server = AgentServer()


class IntakeAgent(Agent):
    def __init__(self, transcript: TranscriptWriter) -> None:
        # Build the full system prompt including the first phase intro
        first_phase = PHASES[0]
        instructions = (
            f"{SYSTEM_PROMPT}\n\n"
            f"You are currently in the '{first_phase['name']}' phase.\n"
            f"Key questions to cover:\n"
            + "\n".join(f"- {q}" for q in first_phase["key_questions"])
        )
        super().__init__(instructions=instructions)
        self._phase_index = 0
        self._transcript = transcript

    async def on_enter(self) -> None:
        phase = PHASES[self._phase_index]
        await self.session.generate_reply(
            instructions=f"Start the session with this intro (say it naturally, don't read it verbatim): {phase['intro']}",
            allow_interruptions=False,
        )

    async def on_user_turn_completed(self, turn_ctx, new_message) -> None:
        self._transcript.add_turn(
            speaker="partner",
            text=str(new_message.content),
            phase=PHASES[self._phase_index]["name"],
        )
        await super().on_user_turn_completed(turn_ctx, new_message)

    def advance_phase(self) -> bool:
        """Move to next phase. Returns False if already on last phase."""
        if self._phase_index >= len(PHASES) - 1:
            return False
        self._phase_index += 1
        next_phase = PHASES[self._phase_index]
        # Update instructions so the LLM knows its current phase
        self.instructions = (
            f"{SYSTEM_PROMPT}\n\n"
            f"You are now in the '{next_phase['name']}' phase.\n"
            f"Key questions to cover:\n"
            + "\n".join(f"- {q}" for q in next_phase["key_questions"])
            + "\n\nOnce you have gathered enough on this phase, say [PHASE_COMPLETE] to move on."
        )
        logger.info("Advanced to phase: %s", next_phase["name"])
        return True


@server.rtc_session(agent_name="intake-agent")
async def intake_session(ctx: agents.JobContext):
    # Parse session/partner metadata from room name: intake-<couple>-<partner>-<session>
    parts = ctx.room.name.split("-")
    session_id = parts[-1] if len(parts) >= 4 else "unknown"
    partner_id = parts[2] if len(parts) >= 4 else "partner-a"

    transcript = TranscriptWriter(session_id=session_id, partner_id=partner_id)
    agent = IntakeAgent(transcript=transcript)

    session = AgentSession(
        stt="openai/whisper-1",
        llm="openai/gpt-4o",
        vad=silero.VAD.load(),
    )

    # Start Tavus avatar — must happen before session.start()
    replica_id = os.environ["TAVUS_REPLICA_ID"]
    persona_id = os.environ["TAVUS_PERSONA_ID"]
    avatar = tavus.AvatarSession(
        replica_id=replica_id,
        persona_id=persona_id,
    )
    await avatar.start(session, room=ctx.room)

    await session.start(
        room=ctx.room,
        agent=agent,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(noise_cancellation=True),
        ),
    )

    # Listen for phase completion signal in agent speech
    @session.on("agent_speech_committed")
    def on_speech(ev):
        text = ev.transcript or ""
        if "[PHASE_COMPLETE]" in text:
            if agent.advance_phase():
                next_phase = PHASES[agent._phase_index]
                session.generate_reply(
                    instructions=(
                        f"Transition naturally to the next section with this intro: {next_phase['intro']}"
                    ),
                    allow_interruptions=False,
                )
            else:
                # Final phase done — wrap up
                session.generate_reply(
                    instructions=(
                        "Thank the partner warmly for sharing. Let them know the intake is complete "
                        "and their therapist will be in touch soon. Keep it brief and warm."
                    ),
                    allow_interruptions=False,
                )
                summary = transcript.finalize()
                logger.info("Transcript saved: %s", summary)

        # Record agent turns (strip the signal token)
        transcript.add_turn(
            speaker="agent",
            text=text.replace("[PHASE_COMPLETE]", "").strip(),
            phase=PHASES[agent._phase_index]["name"],
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agents.cli.run_app(server)
