# Interview Structure

## Based On

[fix-life-in-1-day](https://github.com/evgyur/fix-life-in-1-day) skill structure

## Session Template Format

Each session follows this structure:

```markdown
# Session N: [Title]

## Metadata
- **ID:** session-id
- **Number:** N
- **Phases:** X
- **Time:** XX-XX minutes
- **Framework:** [Psychological framework]

## AI Role

[Persona description - e.g., "Future Trajectory Analyst", "Behavioral Economist"]

## Mission

[Brief description of session goal]

---

## Phase 1: [Phase Title]

### Introduction
[Context-setting text]

### Questions
**1.1** [Question text]
**1.2** [Question text]

### Transition
"[Text to transition to next phase]"

---

## Phase 2: [Phase Title]
[... repeat structure ...]

---

## Summary Template

[Template for session completion summary]
```

## Example Session (Anti-Vision Architect)

**Phases:**
1. Current Reality Excavation
2. The 5-Year Tuesday
3. The 10-Year Tuesday
4. The Living Example
5. The Identity Price Tag
6. The Compressed Anti-Vision

**Key Questions:**
- What's the dull, persistent dissatisfaction you've learned to live with?
- What do you complain about repeatedly but never actually change?
- Describe your average Tuesday 5 years from now if nothing changes
- Who in your life is already living the future you just described?
- What identity would you have to give up to actually change?

**Output:**
"If I don't change, I become [specific outcome] by [specific age], and the cost is [specific loss]."

## Adaptation for Couples Therapy

### Individual Sessions (Partner A & B)

1. **Attachment Style Excavation**
   - Childhood relationship patterns
   - Parent modeling
   - Past relationship patterns
   - Triggers and sensitivities

2. **Conflict Patterns**
   - How you respond to conflict
   - Escalation vs de-escalation behaviors
   - Repair attempts
   - Avoidance patterns

3. **Communication Style**
   - How you express needs
   - How you receive feedback
   - Emotional regulation
   - Shutdown triggers

4. **Expectations & Assumptions**
   - Unspoken expectations
   - Assumptions about partnership
   - Deal-breakers
   - Non-negotiables

5. **Self-Awareness**
   - Blind spots
   - Defensive patterns
   - Contribution to conflict
   - Growth areas

### Joint Analysis Session

After individual interviews:
- Cross-reference Partner A and Partner B responses
- Identify complementary patterns
- Flag mismatched expectations
- Generate follow-up questions

## Memory Persistence

```
memory/
├── partner-a/
│   ├── state.json          # Current session/phase
│   ├── session-01.md       # Responses
│   ├── session-02.md
│   └── insights.md         # Accumulated
└── partner-b/
    ├── state.json
    ├── session-01.md
    ├── session-02.md
    └── insights.md
```

## State Management

`state.json` structure:
```json
{
  "version": 1,
  "partner": "a",
  "currentSession": 1,
  "currentPhase": 1,
  "startedAt": "2026-04-02T12:00:00Z",
  "lastActivityAt": "2026-04-02T12:30:00Z",
  "sessions": {
    "1": {
      "status": "in_progress",
      "phases": {
        "1": {"at": "2026-04-02T12:00:00Z"},
        "2": {"at": "2026-04-02T12:15:00Z"}
      }
    }
  }
}
```

## Next Steps

1. Define 5-8 core sessions for couples therapy
2. Write session markdown templates
3. Build state management (bash scripts or Node.js)
4. Test with real interviews
5. Refine based on feedback
