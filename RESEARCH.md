# Research Notes

## fix-life-in-1-day Analysis

**Repo**: https://github.com/evgyur/fix-life-in-1-day

### Key Learnings

**Session Structure**:
- 10 sessions, each with 3-6 phases
- Each phase includes:
  - AI role/persona
  - Introduction text
  - Questions (numbered)
  - Tasks
  - Transitions between phases
  - Completion summary

**Memory System**:
- State tracked in JSON: `state.json`
- Responses saved per session: `session-01.md`, `session-02.md`, etc.
- Cumulative insights file: `insights.md`
- Progress tracking: current session, current phase, completion status

**State Management**:
```json
{
  "version": 1,
  "lang": "en",
  "currentSession": 1,
  "currentPhase": 1,
  "sessions": {
    "1": {"status": "not_started", "phases": {}},
    "2": {"status": "not_started", "phases": {}}
  }
}
```

**Session Completion**:
- After final phase, generate summary
- Write insights to `insights.md`
- Advance to next session
- Session 10 includes cron reminder generation

**Example Session (Anti-Vision Architect)**:
- 6 phases
- Roles: Future Trajectory Analyst (hospice counselor background)
- Questions dig into: current dissatisfaction, 5-year trajectory, 10-year trajectory, living examples, identity price tag
- Output: Compressed anti-vision statement

### Adaptable Patterns

For couples therapy:
1. **Multi-phase interviews** (replace 10 life sessions with relationship-focused sessions)
2. **Persistent state** (track progress per partner, per phase)
3. **Cumulative memory** (build relationship profile over time)
4. **Structured roles** (therapist personas for different session types)

## Tavus Integration Research

**Docs**: https://docs.tavus.io/sections/conversational-video-interface/persona/llm

### Custom LLM Support

✅ **Tavus supports custom LLM backends**

**Requirements**:
- OpenAI-compatible API format
- Streaming support (SSE)
- Base URL
- API key

**Supported LLMs** (as of Feb 2026):
- Anthropic Claude Sonnet ✅
- OpenAI GPT-4o
- Llama (via Together AI, Fireworks AI)
- Google Gemini (via Pipecat)

### Integration Method

Provide to Tavus:
1. Model name (e.g., `claude-sonnet-4-5`)
2. Base URL (Anthropic API endpoint)
3. API key

Tavus will:
- Stream user audio/video
- Send text transcript to Claude
- Receive streaming text response
- Synthesize response to avatar
- Return video/audio to user

### Session Recording

Tavus can record sessions:
- Video/audio recording to S3
- Transcript export
- Session metadata

**For our use case**:
- Store transcripts in memory system
- Generate post-session summary
- Track progress over multiple sessions

## WhatsApp Export Format

**Export Method**: WhatsApp > Chat > Export Chat > Without Media

**Format**:
```
[01/04/2026, 14:23:15] Alice: Hey, can we talk about last night?
[01/04/2026, 14:25:42] Bob: Yeah, I've been thinking about it too
[01/04/2026, 14:26:10] Alice: I felt like you shut down when I brought up finances
```

**Parsing Strategy**:
- Regex: `\[(.*?)\] (.*?): (.*)`
- Group 1: Timestamp
- Group 2: Sender name
- Group 3: Message content

**Analysis Window**: 3-6 months (sufficient for pattern detection)

## Pipecat Integration (Alternative)

**Repo**: https://github.com/Tavus-Engineering/tavus-examples

Pipecat is an open-source framework for real-time AI interactions (Tavus uses it internally).

**Could be used for**:
- Custom WebRTC integration
- Direct Claude streaming without Tavus
- Custom avatar/UI

**Trade-offs**:
- More control, more complexity
- Need to handle WebRTC, audio processing, video synthesis
- Tavus is easier for MVP

**Decision**: Start with Tavus, consider Pipecat if custom requirements emerge

## References

- [Tavus LLM Integration](https://docs.tavus.io/sections/conversational-video-interface/persona/llm)
- [Building Real-Time AI with Pipecat and Tavus](https://www.tavus.io/post/open-sourcing-ai-innovation-building-real-time-ai-interactions-with-pipecat-and-tavus)
- [fix-life-in-1-day](https://github.com/evgyur/fix-life-in-1-day)
- [Using Llama 3 8B with Tavus](https://www.tavus.io/post/using-llama-3-8b-to-power-your-conversational-ai)
