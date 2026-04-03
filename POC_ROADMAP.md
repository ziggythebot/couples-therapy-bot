# PoC Roadmap: Relationship Pattern Discovery -> Licensed-Supervised Therapy Bot

## Goal
Build a staged product that proves value early (pattern discovery) and de-risks progression toward guided therapy with licensed oversight.

## Product Positioning (Now)
"Relationship pattern discovery" rather than "AI therapy."

Outputs:
- Conflict loop map
- Trigger map (topic, timing, wording)
- Repair opportunity map
- 7-day behavior experiment

## Phase Plan

### Phase 0: Foundation (1 week)
- Consolidate docs and remove duplicates
- Define source-of-truth architecture and terminology
- Lock data model for:
  - partners
  - sessions
  - chat artifacts
  - generated insights
- Add risk policy (crisis/abuse/self-harm handling)

Exit criteria:
- One canonical architecture doc
- One canonical interview spec
- One canonical Tavus note
- Safety policy documented

### Phase 1: Pattern Discovery PoC (2-3 weeks)
- Intake collection (text or Tavus transcript ingest)
- WhatsApp parser + deterministic metrics
- LLM synthesis step for readable relationship brief
- Generate `relationship-brief.md` with:
  - top patterns
  - top triggers
  - evidence snippets
  - 7-day experiment

Exit criteria:
- End-to-end run on 3+ sample couples
- Both partners rate output useful/accurate

### Phase 2: Guided Conversation Layer (2-4 weeks)
- Turn-based conversation protocol
- Prompted structure: opening -> reflection -> repair attempt -> agreement
- Time-boxed transcript and summary

Exit criteria:
- Session completion rate and perceived fairness from both partners
- No major safety incidents in pilot runs

### Phase 3: Licensed Oversight Layer (parallel/next)
- Clinical review workflow for prompts/output
- Escalation routing and intervention boundaries
- Human-in-the-loop approvals for high-risk flags

Exit criteria:
- Reviewed protocol set
- Signed off escalation flow
- QA rubric for response quality/safety

### Phase 4: Real-time Therapy Experience (later)
- Tavus real-time session only after Phase 1-3 are stable
- Keep supervision hooks and safety gating active

Exit criteria:
- Latency and safety thresholds met
- Licensed reviewer confidence for broader pilot

## Success Metrics

### PoC Metrics
- Intake completion rate
- Partner-rated usefulness
- Partner-rated fairness (both felt accurately represented)
- 7-day experiment adherence

### Risk Metrics
- High-risk detection precision/recall (manual review)
- Escalation correctness
- Incidents per 100 sessions

## Current Repo Assessment

Strengths:
- Strong conceptual architecture and therapeutic framing
- Clear multi-phase flow
- Good early thought on memory/state

Weaknesses:
- Documentation duplication and drift (`-` vs `_` filenames)
- No canonical implementation spec (APIs, modules, contracts)
- Safety/compliance not operationalized (only principles)
- No test plan or evaluation rubric
- No milestone ownership or delivery sequencing

## Immediate Next Actions
1. Canonicalize duplicate docs.
2. Add implementation spec (`IMPLEMENTATION_PLAN.md`) with concrete modules and interfaces.
3. Add `SAFETY_POLICY.md` with stop/escalation logic.
4. Scaffold parser + brief generator pipeline.

