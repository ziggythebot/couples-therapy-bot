# Stage 1 Implementation Plan (PoC Fast Mode): LiveKit + Tavus Intake

Date: 2026-04-03

## Stage 1 Objective
Ship a working intake interview system fast:
- partner joins live session
- AI interviewer runs structured intake
- session transcript + recording saved
- intake artifact written for downstream analysis

## Stage 1 Priorities
1. Working end-to-end flow
2. Stable transcript + recording capture
3. Clean artifacts for analysis pipeline

## Explicit Non-Priority (for this stage)
- Advanced security hardening
- Compliance controls
- Production-grade infra robustness

## Scope
In scope:
- LiveKit room/token/session setup
- AI interviewer agent
- Tavus visual avatar through LiveKit integration
- Recording (egress)
- Transcript persistence
- Intake artifact writer

Out of scope:
- Joint couples session engine
- Licensed clinician workflows
- Billing/admin
- Deep safety orchestration

## Architecture (PoC)

Components:
1. `apps/session-api`
- creates room + token
- returns join details
- ends session

2. `services/agent-worker` (Python)
- runs interview state machine
- drives LLM prompts
- emits transcript turns

3. `services/avatar-worker` (Tavus via LiveKit)
- publishes visual avatar stream

4. `services/ingress-processor`
- writes transcript + metadata
- generates intake artifacts

5. `apps/intake-web`
- joins room
- shows avatar + simple session status

## Minimal Security Baseline (only)
- Keep API keys server-side
- Short-lived participant token
- No public write endpoints without token

Everything else deferred to later stage.

## LiveKit Setup Checklist
1. Create LiveKit Cloud project.
2. Add env vars:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `OPENAI_API_KEY` (or Anthropic)
   - `TAVUS_API_KEY`
   - `TAVUS_REPLICA_ID`
   - `TAVUS_PERSONA_ID`
3. Install Python agent deps:
   - `livekit-agents`
   - `livekit-plugins-openai` (or equivalent)
   - `livekit-agents[tavus]`
4. Validate a test room join with local frontend.
5. Enable egress recording (auto-egress preferred for speed).

## Build Backlog (Execution Order)

## Epic A: Foundation (Day 1-2)
A1. Scaffold project folders and env templates
A2. Build `POST /api/intake/session` for room + token
A3. Build `POST /api/intake/session/:id/end`

Acceptance:
- client joins room successfully
- session end endpoint returns success

## Epic B: Agent + Avatar (Day 3-4)
B1. Agent joins room and runs scripted interview phases
B2. Tavus avatar integrated and visible in room

Interview phases (v1):
1. intro and consent
2. relationship baseline
3. conflict/trigger questions
4. reflection close

Acceptance:
- full scripted interview can be completed in one session
- avatar video/audio is present throughout

## Epic C: Transcript + Recording (Day 5-6)
C1. Persist transcript turns to JSON + markdown
C2. Enable and verify room recording artifact
C3. Link session -> transcript -> recording metadata

Acceptance:
- every completed session has transcript + recording reference

## Epic D: Intake Artifacts (Day 7-8)
D1. Write canonical files:
- `memory/partner-a/session-001.json|md`
- `memory/partner-b/session-001.json|md`
- `memory/relationship/intake-index.json`
D2. Add minimal normalization (speaker labels, timestamps, phase markers)

Acceptance:
- artifacts generated automatically after session end
- artifacts readable by downstream analysis

## Epic E: Stabilization (Day 9-10)
E1. Run 3 mock end-to-end sessions
E2. Fix highest-friction bugs
E3. Finalize runbook for build handoff

Acceptance:
- reproducible setup and run in under 60 minutes

## API Contracts

## `POST /api/intake/session`
Request:
```json
{
  "couple_id": "cpl_123",
  "partner_id": "partner-a",
  "intake_version": "v1"
}
```

Response:
```json
{
  "session_id": "ses_abc",
  "room_name": "intake-cpl_123-partner-a-ses_abc",
  "token": "<jwt>",
  "ws_url": "wss://<livekit-host>",
  "join_expires_at": "2026-04-03T14:30:00Z"
}
```

## `POST /api/intake/session/:id/end`
Request:
```json
{
  "reason": "completed"
}
```

Response:
```json
{
  "ok": true,
  "recording_status": "processing",
  "transcript_status": "available"
}
```

## Definition of Done (Stage 1)
- A partner can complete one full intake session.
- Session produces transcript artifact.
- Session produces recording artifact (or valid egress reference).
- Intake artifacts are written to `memory/` in agreed schema.
- Build agent can run setup from docs and reproduce flow.

## Handoff Package
1. This file
2. `IMPLEMENTATION_PLAN.md`
3. `TAVUS_INGRESS_FEASIBILITY.md`
4. `REALTIME_VIDEO_AI_OPTIONS.md`

## References
- LiveKit avatar integrations: https://docs.livekit.io/agents/integrations/avatar/
- LiveKit Tavus plugin: https://docs.livekit.io/agents/integrations/avatar/tavus/
- LiveKit egress overview: https://docs.livekit.io/home/egress/overview
- LiveKit auto-egress: https://docs.livekit.io/home/egress/autoegress
- Tavus LiveKit integration: https://docs.tavus.io/sections/integrations/livekit
