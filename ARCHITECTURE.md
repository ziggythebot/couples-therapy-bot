# Architecture

## System Overview

Couples Therapy Bot is a multi-phase conversational AI system that combines:
- Structured psychological interviews
- Behavioral analysis (via WhatsApp chat history)
- Real-time video therapy sessions

## Components

### 1. Interview Engine

**Based on**: fix-life-in-1-day skill structure

**Structure**:
- Session-based progression (JSON state management)
- Phase-by-phase questioning within each session
- Persistent memory (`session-XX.md`, `insights.md`)
- Summary generation after each session

**Key Patterns**:
- **AI Role/Persona**: Each session has a specific therapeutic role (e.g., "Future Trajectory Analyst", "Behavioral Economist")
- **Phased Questions**: 3-6 phases per session, each with introduction, questions, tasks, transitions
- **State Tracking**: `state.json` tracks current session/phase, completion status
- **Memory Persistence**: Responses saved to markdown files, insights extracted and accumulated

**Adaptation for Couples**:
- Separate state files for Partner A and Partner B
- Parallel interview tracks
- Cross-reference responses in analysis phase

### 2. WhatsApp Chat Analyzer

**Input**: WhatsApp chat export (`.txt` format)

**Analysis Dimensions**:
- **Communication patterns**: Who initiates, who withdraws, repair attempts
- **Conflict dynamics**: Escalation triggers, de-escalation patterns
- **Temporal patterns**: Frequency, timing, gaps in communication
- **Emotional tone**: Sentiment analysis over time
- **Recurring themes**: Topics, complaints, unresolved issues

**Output**: Structured analysis saved to `chat-analysis.md`

### 3. Follow-up Interview Generator

**Input**:
- Partner A profile
- Partner B profile
- Chat analysis

**Process**:
- Identify gaps between self-reported behavior and actual behavior
- Generate targeted questions to address blind spots
- Confront patterns gently with evidence from chat

**Output**: Custom follow-up session questions

### 4. Live Session Interface

**Tech Stack**:
- **Avatar**: Tavus AI (conversational video interface)
- **LLM**: Claude Sonnet 4.5 (via OpenAI-compatible API)
- **Session Management**: Time-boxed (15-30 min), recorded transcripts

**Integration Points**:

```
Tavus API → Claude API (OpenAI-compatible endpoint)
         ← Streaming response (SSE)

Session Recording → S3/Storage
Transcript → Memory system (session-transcripts/)
```

**Context Injection**:
- Full partner profiles loaded into system prompt
- Chat analysis summary included
- Follow-up insights referenced
- Session goals defined upfront

### 5. Memory System

**Structure**:
```
memory/
├── partner-a/
│   ├── profile.md          # Core psychological profile
│   ├── session-01.md       # Interview responses
│   ├── session-02.md
│   └── insights.md         # Accumulated insights
├── partner-b/
│   ├── profile.md
│   ├── session-01.md
│   ├── session-02.md
│   └── insights.md
├── relationship/
│   ├── chat-analysis.md    # WhatsApp analysis
│   ├── patterns.md         # Cross-partner patterns
│   └── goals.md            # Therapeutic goals
└── sessions/
    ├── session-001.json    # Tavus session metadata
    ├── session-001.txt     # Transcript
    ├── session-002.json
    └── session-002.txt
```

## Flow Diagram

```
┌─────────────────────────────────────────────┐
│ Phase 1: Individual Interviews (Async)      │
│                                             │
│  Partner A Interview  ║  Partner B Interview│
│  (sessions 1-N)       ║  (sessions 1-N)     │
│         ↓             ║         ↓           │
│  profile.md           ║  profile.md         │
│  insights.md          ║  insights.md        │
└──────────────┬────────────────┬─────────────┘
               ↓                ↓
┌─────────────────────────────────────────────┐
│ Phase 2: WhatsApp Chat Analysis             │
│                                             │
│  Export WhatsApp chat → Parse → Analyze    │
│                           ↓                 │
│                    chat-analysis.md         │
│                    patterns.md              │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│ Phase 3: Follow-up Interview                │
│                                             │
│  Generate questions from analysis           │
│  Address blind spots                        │
│  Confront patterns with evidence            │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│ Phase 4: Live Joint Session (Real-time)     │
│                                             │
│  Tavus Avatar + Claude Backend              │
│  15-30 min time-boxed                       │
│  Full context loaded                        │
│         ↓                                   │
│  Transcript saved to memory                 │
└─────────────────────────────────────────────┘
```

## Implementation Notes

### Tavus + Claude Integration

**Requirements**:
- OpenAI-compatible API endpoint (Claude provides this)
- Streaming support (SSE)
- Base URL + API key

**Configuration** (from Tavus docs):
```json
{
  "model": "claude-sonnet-4.5",
  "base_url": "https://api.anthropic.com/v1",
  "api_key": "sk-ant-..."
}
```

**Session Recording**:
- Tavus can record sessions to S3
- Transcripts available via API
- Save to `sessions/session-XXX.txt`

### Memory Persistence Strategy

- **Partner profiles**: Update rarely (foundational)
- **Session responses**: Append-only (historical record)
- **Insights**: Accumulated, never deleted
- **Chat analysis**: One-time generation, reference only
- **Session transcripts**: Append-only, full history

### Time Management

- **Interviews**: No time limit (thoughtful, deep)
- **Chat analysis**: Background processing (async)
- **Live sessions**: Strict 15-30 min limit
  - Timer shown to participants
  - Warning at 5 min remaining
  - Hard stop at limit (can schedule follow-up)

## Next Steps

1. Build interview session templates (adapt from fix-life-in-1-day)
2. Implement WhatsApp parser
3. Build chat analysis engine
4. Wire up Tavus + Claude integration
5. Create memory management system
6. Build session scheduling/time management
