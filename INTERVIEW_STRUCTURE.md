# Interview Structure

Based on [fix-life-in-1-day](https://github.com/evgyur/fix-life-in-1-day) session architecture.

## Session Format

Each session has:
- **AI Persona**: Specific role/expertise
- **Phases**: 3-6 phases per session
- **Questions**: Structured, building on previous answers
- **Transitions**: Guide user between phases
- **Summary**: Key insights saved to memory

## Example: Anti-Vision Session

**AI Role**: Future Trajectory Analyst (12 years hospice counselor, documented 2000+ regret patterns)

**Mission**: Help user see where current trajectory leads

**6 Phases**:
1. Current Reality Excavation
2. The 5-Year Tuesday (projection)
3. The 10-Year Tuesday (compound effects)
4. The Living Example (someone ahead on same path)
5. The Identity Price Tag (what must be released)
6. Compressed Anti-Vision Statement

**Output**: Single powerful statement the user can't argue with

## Couples Therapy Adaptation

### Session 1: Relationship Anti-Vision (Individual)

Each partner separately:
- What persistent dissatisfaction have you learned to tolerate in the relationship?
- Describe a typical Tuesday 5 years from now if nothing changes
- Who do you know in a relationship like the one you're heading toward?
- What identity would you have to release to improve things?
- Anti-vision statement: "If we don't change, we become [X] by [age], and the cost is [Y]"

### Session 2: Hidden Goals Decoder (Individual)

Each partner:
- What do you say you want from the relationship but haven't achieved?
- What do you actually do instead of pursuing it?
- What payoff are you getting from the current state?
- "I'm not failing at [X]. I'm succeeding at [Y]."

### Session 3: Communication Patterns (Individual)

Each partner:
- How do you typically handle conflict?
- When do you withdraw vs engage?
- What triggers you most?
- What repair attempts work/don't work?

### Session 4: Attachment & Origins (Individual)

Each partner:
- Attachment style assessment
- Childhood patterns with conflict/intimacy
- How parents/caregivers modeled relationships
- What beliefs about relationships did you inherit vs choose?

## Memory Persistence

**After Each Phase**:
```markdown
# Session X: [Title]
Started: 2026-04-15 10:00

## Phase 1

[User response saved here]

---

## Phase 2

[User response saved here]

---
```

**After Each Session**:
- Key insights extracted
- Summary saved to `insights.md`
- State updated (session X completed)

## State Management

```json
{
  "version": 1,
  "partner": "A",
  "currentSession": 2,
  "currentPhase": 3,
  "sessions": {
    "1": {"status": "completed", "completedAt": "2026-04-15T11:30:00Z"},
    "2": {"status": "in_progress", "phases": {"1": {}, "2": {}}}
  }
}
```

## Questions to Develop

**For Couples Therapy**:
- How many sessions before chat analysis?
- Should partners see each other's responses?
- What therapeutic frameworks to apply? (Gottman, EFT, Attachment-based?)
- How to handle asymmetric completion (one partner finishes before other)?
- When to move to joint session?

## Implementation Notes

- Build as GhostClaw skill (like fix-life-in-1-day)
- Session files in `memory/life-architect/` pattern
- Bash script handler for state management
- JSON state file + markdown session files
