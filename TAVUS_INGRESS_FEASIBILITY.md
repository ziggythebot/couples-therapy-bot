# Tavus Feasibility Review (Ingress First Interview)

Date: 2026-04-03

## Executive Answer
Yes, Tavus is implementation-ready for an initial interview ingress flow where Tavus handles live conversation capture and your backend consumes final transcript + optional recording after the session ends.

The fastest reliable PoC path is:
1. Create persona (with guardrails/objectives attached)
2. Create conversation (`callback_url`, `require_auth`, `max_participants=2`)
3. Embed/join `conversation_url`
4. Receive `application.transcription_ready` webhook
5. Ingest transcript into your memory + analysis pipeline

## What Is Confirmed Possible

### 1. Create and run real-time conversations
Confirmed via `POST /v2/conversations` and returned `conversation_url`.

Implementation impact:
- You can start one intake session per partner on demand.
- You can drive your own room/session lifecycle from backend.

### 2. Use Tavus-hosted LLM OR custom OpenAI-compatible LLM
Tavus persona LLM layer supports custom model config with:
- `model`
- `base_url`
- `api_key`

Custom LLM prerequisites explicitly include:
- streamable responses (SSE)
- `/chat/completions` compatibility

Implementation impact:
- For PoC speed, use Tavus-hosted models first.
- Switch to custom backend later without replacing Tavus room layer.

### 3. Persist cross-session memory tags
`memory_stores` can be passed on conversation creation.

Implementation impact:
- Tag conversations by couple/partner to preserve continuity for intake rounds.

### 4. Attach structured Objectives and Guardrails
Persona accepts `objectives_id` and `guardrails_id`.

Implementation impact:
- Objectives can enforce interview progression and output variables.
- Guardrails can enforce conversational safety boundaries.

### 5. Receive end-of-call transcript by webhook
When `callback_url` is configured, Tavus callback events include:
- `application.transcription_ready` (chat history returned)
- `application.recording_ready` (if recording configured + used)
- `system.shutdown` (with shutdown reason)

Implementation impact:
- This is exactly the ingress handoff point for your analysis pipeline.

### 6. Transcript retrieval alternative via Get Conversation
`GET /v2/conversations/{id}?verbose=true` can return additional event data including transcript and shutdown metadata.

Implementation impact:
- Useful fallback if webhook delivery fails.

### 7. Embed options are flexible
Supported embed approaches include:
- `@tavus/cvi-ui`
- iframe
- vanilla JS
- Node+Express wrapper
- Daily JS SDK (full control)

Implementation impact:
- You can ship quickly with iframe/cvi-ui, then move to Daily SDK when UX control matters.

## Ingress Architecture (Recommended for Your PoC)

## Step A: Session setup API (your backend)
Input: `couple_id`, `partner_id`

Backend actions:
1. Resolve persona/replica IDs
2. Create Tavus conversation with:
   - `persona_id`
   - `replica_id` (or persona default)
   - `callback_url` (required for push ingress)
   - `require_auth=true`
   - `max_participants=2`
   - `conversation_name` (deterministic id)
   - `memory_stores=["couple_<id>_partner_<id>"]`
3. Return join URL/token to frontend

## Step B: Frontend join
- Embed Tavus via iframe or cvi-ui.
- User completes interview.

## Step C: Webhook ingestion endpoint
On callback:
1. Verify event authenticity (HMAC/signature if available in your final Tavus config; otherwise strict allowlist + secret path + IP controls as interim)
2. Store raw payloads
3. Handle events:
   - `application.transcription_ready` -> normalize transcript, persist as canonical intake artifact
   - `application.recording_ready` -> link recording key
   - `system.shutdown` -> mark session ended with reason

## Step D: Post-processing pipeline
- Run risk scan
- Extract interview fields
- Write:
  - `memory/partner-*/session-*.md`
  - `memory/partner-*/profile.md`
  - `memory/relationship/intake-index.json`

## Practical API Template (PoC)

### Create Persona (example fields)
- `system_prompt`
- `pipeline_mode=full`
- `default_replica_id` (optional)
- `objectives_id` (recommended)
- `guardrails_id` (recommended)
- `layers.llm` (Tavus-hosted first, custom later)

### Create Conversation (example fields)
- `persona_id`
- `replica_id`
- `callback_url`
- `conversation_name`
- `require_auth=true`
- `max_participants=2`
- `memory_stores=[...]`

## Constraints and Caveats

1. Transcript timing
- Confirmed callback is `application.transcription_ready` after conversation ends.
- For PoC ingress, design around end-of-session transcript, not real-time structured extraction.

2. Guardrails are not absolute guarantees
- Tavus explicitly frames guardrails as guidance and part of broader safety strategy.
- Keep your own downstream safety scanner in pipeline.

3. Custom LLM path adds latency/ops complexity
- Works, but PoC speed favors Tavus-hosted model first.

4. Recording payload specifics
- Docs indicate `application.recording_ready` and sample `s3_key` usage.
- Final storage setup should be validated in a technical spike before relying on recordings as source of truth.

## Suggested Build Decision (Now)

For your first interview ingress:
- Yes: Tavus for real-time capture + transcript webhook ingress
- No (for now): real-time therapeutic reasoning in-session
- Yes: asynchronous analysis and summary generation post-call

This keeps risk and complexity down while proving data quality and user experience.

## Open Questions To Resolve In 1-Day Spike

1. Webhook auth/signature verification method in your Tavus account setup
2. Exact payload shape for `application.recording_ready` in your environment
3. Objective completion callback schema + reliability under interruption
4. Transcript normalization rules for mixed roles/system messages

## Sources
- Tavus API: Create Conversation
  - https://docs.tavus.io/api-reference/conversations/create-conversation
- Tavus API: Get Conversation (`verbose=true` notes)
  - https://docs.tavus.io/api-reference/conversations/get-conversation
- Tavus docs: Webhooks and Callbacks
  - https://docs.tavus.io/sections/webhooks-and-callbacks
- Tavus docs: Persona LLM Layer (hosted + custom LLM prerequisites)
  - https://docs.tavus.io/sections/conversational-video-interface/persona/llm
- Tavus API: Create Persona (objectives/guardrails/layers fields)
  - https://docs.tavus.io/api-reference/personas/create-persona
- Tavus API: Create Objectives
  - https://docs.tavus.io/api-reference/objectives/create-objectives
- Tavus docs/API: Guardrails
  - https://docs.tavus.io/sections/conversational-video-interface/persona/guardrails
  - https://docs.tavus.io/api-reference/guardrails/create-guardrails
- Tavus docs: Embedding CVI
  - https://docs.tavus.io/sections/integrations/embedding-cvi
- Tavus docs: Memories
  - https://docs.tavus.io/sections/conversational-video-interface/memories
