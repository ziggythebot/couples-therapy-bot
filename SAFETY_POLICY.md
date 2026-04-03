# Safety Policy (PoC)

## Purpose
Define minimum safety controls for a relationship pattern discovery PoC.

This system is not a replacement for therapy, crisis support, emergency services, or legal advice.

## Safety Boundary
The PoC may:
- Summarize communication patterns
- Highlight potential conflict/repair dynamics
- Suggest low-risk conversation experiments

The PoC must not:
- Diagnose mental health conditions
- Assign blame or make legal judgments
- Advise users to remain in unsafe situations
- Provide crisis counseling as a substitute for emergency support

## High-Risk Categories

Trigger immediate stop/flag when input or output indicates potential:
- Self-harm or suicidal ideation
- Harm to others
- Domestic violence or coercive control
- Child abuse or threats involving minors
- Stalking, severe intimidation, credible threats

## Detection Strategy (PoC)

Two-layer detection:
1. Deterministic rules:
   - Keyword and phrase sets
   - Pattern matches for threats/coercion indicators
2. LLM risk classifier pass:
   - Structured yes/no risk categories with confidence

If either layer flags high-risk -> mark `status=blocked`.

## Blocked-Case Behavior

When blocked:
- Do not generate therapeutic guidance.
- Return a short safety-forward message.
- Provide local emergency guidance placeholder and encourage immediate human support.
- Write `memory/relationship/risk-report.json` with detected categories and evidence references.

## Human Oversight Hooks

For PoC with licensed input:
- Route blocked cases to manual review queue.
- Require explicit reviewer approval to continue any interaction.
- Log reviewer decision and rationale.

## Output Constraints

All generated outputs must:
- Use non-diagnostic language
- Separate observations from inferences
- Include evidence snippets for claims
- Avoid absolute statements ("always", "never") unless directly quoted
- Include confidence labeling (`low`, `medium`, `high`) per major pattern

## Data Handling (PoC)

Minimum controls:
- Store only data required for analysis
- Use anonymized sample data for testing
- Keep artifacts local by default
- Support deletion of couple data by directory removal

Recommended next step:
- Add encryption-at-rest and retention window before external pilots

## Safety Message Template

"I may be missing important context, and I’m not a crisis service. If there is immediate danger, contact local emergency services now. If you’re feeling unsafe in your relationship, seek support from a qualified professional or trusted local hotline."

## Review Cadence

- Weekly review of false positives/false negatives in risk detection
- Update rule lists and classifier prompt accordingly
- Document changes in `SAFETY_CHANGES.md`
