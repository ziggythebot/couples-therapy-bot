# Realtime Video AI Options (Control + Direction + Recording)

Date: 2026-04-03

## Your requirement
You want a platform where you can:
1. control interview flow and prompts
2. direct behavior/safety constraints
3. reliably record sessions and ingest transcripts

## Quick answer
Top practical options for your use case:
- Tavus (fastest managed path with conversation callbacks)
- D-ID Agents (strong built-in exports + bring-your-own/custom LLM)
- LiveKit + your own agent stack (max control, more engineering)
- Daily + Pipecat (+ optional Tavus/Simli rendering) (max flexibility, more integration work)

## Option Comparison

## 1) Tavus (managed conversational video)
What you get:
- Conversation API + join URL lifecycle
- Persona controls with system prompt/layers
- Objective + Guardrail attachments
- Webhook callbacks including transcription-ready and recording-ready events
- Memory store hooks for continuity

Control level:
- High for managed platform; lower than fully self-built RTC.

Recording/transcript:
- Strong; callback-driven ingestion model is straightforward.

Best for:
- Shipping intake ingress fastest with low infra burden.

## 2) D-ID Agents (managed realtime avatar + agent)
What you get:
- Realtime WebRTC sessions via SDK
- Agent creation with LLM instructions
- Built-in/custom LLM options (OpenAI-compatible custom endpoints)
- Chat Exports API (ZIP + JSON logs)

Control level:
- High on agent behavior and model routing; less transport-level control than self-hosted RTC.

Recording/transcript:
- Strong for conversation history export (JSON).

Best for:
- Teams wanting managed visual agents and clean analytics/export workflow.

## 3) LiveKit + custom agent backend (self-directed)
What you get:
- Full RTC control
- Egress APIs for room/participant recording (MP4/HLS, multiple outputs)
- Deep observability and custom orchestration options

Control level:
- Very high (highest among options listed).

Recording/transcript:
- Very strong recording primitives; transcript strategy depends on your STT/agent pipeline.

Best for:
- Product teams that need maximum control and can handle infra complexity.

## 4) Daily + Pipecat (+ avatar renderer)
What you get:
- Daily hosted WebRTC transport
- Pipecat pipeline control for STT/LLM/TTS/event logic
- Recording/transcription features via Daily
- Optional renderer integrations (TavusTransport, HeyGenTransport, Simli)

Control level:
- Very high in conversation logic and orchestration.

Recording/transcript:
- Strong; built into Daily + pipeline-level events.

Best for:
- Teams wanting open, composable architecture and custom orchestration.

## Important market note (as of April 3, 2026)
HeyGen Interactive Avatar docs explicitly state sunset on **March 31, 2026**. New builds should target **LiveAvatar** instead of legacy Interactive Avatar paths.

## Recommended decision path for your project

### If speed is #1 (PoC in days)
- Start Tavus for intake ingress + webhook transcript ingestion.

### If export/analytics depth is #1 with managed platform
- Evaluate D-ID Agents next (especially Chat Exports workflow).

### If long-term product control is #1
- Plan migration/parallel spike on LiveKit or Daily+Pipecat.

## 7-day technical spike plan
1. Tavus spike: create conversation -> receive transcription callback -> write canonical intake artifact.
2. D-ID spike: run one agent session -> export chat logs -> compare schema/quality.
3. Control baseline: prototype one scripted session on LiveKit or Daily+Pipecat and validate recording + event hooks.
4. Score each on:
   - flow control
   - safety control points
   - transcript quality
   - recording reliability
   - implementation time

## Sources
- Tavus: Create Conversation
  - https://docs.tavus.io/api-reference/conversations/create-conversation
- Tavus: Webhooks and callbacks
  - https://docs.tavus.io/sections/webhooks-and-callbacks
- Tavus: Persona LLM
  - https://docs.tavus.io/sections/conversational-video-interface/persona/llm
- Tavus: Create Persona
  - https://docs.tavus.io/api-reference/personas/create-persona
- D-ID: Quickstart
  - https://docs.d-id.com/docs
- D-ID: Agent Sessions
  - https://docs.d-id.com/docs/agent-session-quickstart
- D-ID: Chat Exports
  - https://docs.d-id.com/docs/chat-exports-quickstart
- D-ID: Custom LLMs
  - https://docs.d-id.com/docs/custom-llms
- LiveKit: Egress overview
  - https://docs.livekit.io/home/egress/overview
- LiveKit: Egress API
  - https://docs.livekit.io/home/egress/api
- Daily: Recording calls guide
  - https://docs.daily.co/guides/products/live-streaming-recording/recording-calls-with-the-daily-api
- Pipecat: Daily transport
  - https://docs.pipecat.ai/server/services/transport/daily
- Pipecat: Tavus integration
  - https://docs.pipecat.ai/server/services/transport/tavus
- HeyGen: Streaming API notice (Interactive Avatar sunset)
  - https://docs.heygen.com/docs/streaming-api
- HeyGen: LiveAvatar intro
  - https://help.heygen.com/en/articles/12758516-introducing-liveavatar
