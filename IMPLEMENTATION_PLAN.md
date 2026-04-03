# Implementation Plan (PoC)

## Scope
Build a runnable PoC for relationship pattern discovery:
- Ingest intake transcripts (text file or Tavus transcript export)
- Parse WhatsApp chat exports
- Generate deterministic communication metrics
- Produce a synthesized `relationship-brief.md`

Out of scope for PoC:
- Real-time therapy orchestration
- Autonomous high-stakes intervention
- Full clinical workflow tooling

## Proposed Stack
- Runtime: Node.js (TypeScript)
- Storage: local filesystem (markdown/json artifacts)
- LLM provider: configurable adapter (Anthropic/OpenAI compatible)
- Interface: CLI first

## Project Structure

```text
src/
  config/
    env.ts
  domain/
    types.ts
    schemas.ts
  intake/
    ingestTranscript.ts
    normalizeIntake.ts
  whatsapp/
    parseWhatsapp.ts
    metrics.ts
    themes.ts
  synthesis/
    buildPrompt.ts
    generateBrief.ts
  safety/
    riskScan.ts
    escalation.ts
  pipeline/
    runPoc.ts
  io/
    readWrite.ts
    logger.ts
memory/
  partner-a/
  partner-b/
  relationship/
samples/
  whatsapp/
  intake/
```

## Data Contracts

### `IntakeArtifact`
```ts
{
  partnerId: "partner-a" | "partner-b";
  source: "tavus-transcript" | "text";
  collectedAt: string; // ISO
  turns: Array<{speaker: string; text: string; ts?: string}>;
}
```

### `WhatsappMessage`
```ts
{
  timestamp: string; // ISO
  sender: string;
  text: string;
  isSystem: boolean;
}
```

### `RelationshipMetrics`
```ts
{
  messageBalance: {partnerA: number; partnerB: number};
  initiationRate: {partnerA: number; partnerB: number};
  responseLatencyMinutes: {partnerAAvg: number; partnerBAvg: number};
  silenceGaps: Array<{start: string; end: string; hours: number}>;
  conflictSignals: Array<{timestamp: string; sender: string; signal: string}>;
  repairSignals: Array<{timestamp: string; sender: string; signal: string}>;
}
```

## Pipeline

1. Ingest partner intake transcripts -> normalize -> save JSON artifacts.
2. Parse WhatsApp export -> save normalized messages.
3. Compute deterministic metrics + candidate themes.
4. Run safety risk scan over inputs and generated output.
5. Generate relationship brief markdown.
6. Persist outputs:
   - `memory/relationship/chat-analysis.md`
   - `memory/relationship/relationship-brief.md`
   - `memory/relationship/risk-report.json`

## CLI Commands

- `npm run poc -- --intakeA <file> --intakeB <file> --chat <file>`
- `npm run parse:chat -- --input <file>`
- `npm run synth:brief -- --context <dir>`
- `npm run risk:scan -- --context <dir>`

## Milestones

### M1: Foundation (2-3 days)
- Scaffold TypeScript project
- Implement filesystem I/O and domain types
- Add sample fixtures

### M2: WhatsApp Parser + Metrics (3-4 days)
- Parser for multiline and system messages
- Deterministic metrics calculations
- Unit tests for edge cases

### M3: Intake Ingest + Normalization (2 days)
- Generic transcript ingestion
- Partner artifact generation

### M4: Brief Synthesis + Safety Scan (3-4 days)
- Prompt template + LLM adapter
- Risk scanning pass pre/post generation
- Markdown output formatter

### M5: E2E + Evaluation (2-3 days)
- Run on 3+ anonymized sample datasets
- Measure usefulness/fairness feedback
- Fix highest-friction issues

## Testing Plan

- Unit tests:
  - WhatsApp parsing (date formats, multiline, malformed lines)
  - Metrics correctness
  - Risk keyword and pattern detection
- Integration tests:
  - Full pipeline on sample fixtures
- Golden file tests:
  - Stable markdown shape for relationship brief

## Implementation Risks

- Sender disambiguation errors in chat exports
- Over-interpretation by LLM synthesis layer
- Conflicts between deterministic metrics and narrative output

Mitigations:
- Keep evidence snippets tied to each claim
- Label confidence per finding
- Do not infer diagnosis or intent

## Definition of Done (PoC)

- One-command end-to-end run from raw files to brief
- Outputs are inspectable and reproducible
- Safety scanner blocks/flags risky cases
- At least 3 pilot runs completed with feedback captured
