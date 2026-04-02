# Couples Therapy Bot

AI-powered couples therapy system combining structured interviews, communication analysis, and real-time sessions.

## Architecture

### Four-Phase Flow

1. **Individual Interviews (Async)**
   - Partner A: Psychological profile, attachment style, triggers, childhood patterns
   - Partner B: Same structured interview
   - Based on "fix-life-in-1-day" session structure

2. **WhatsApp Chat Analysis**
   - Ingest exported WhatsApp chat history
   - Analyze communication patterns, conflict dynamics, repair attempts
   - Identify escalation triggers, avoidance patterns, emotional regulation

3. **Follow-up Interview**
   - Targeted questions based on chat analysis
   - Address gaps between self-perception and actual behavior
   - Confront blind spots identified in communication patterns

4. **Live Joint Session (Real-time)**
   - 15-30 minute time-boxed discussion
   - Tavus AI avatar for visual presence
   - Claude backend with full context (profiles + chat analysis + follow-ups)
   - Session transcripts saved to memory

## Tech Stack

- **LLM Backend**: Claude (via Anthropic API)
- **Avatar**: Tavus AI (supports custom LLM integration)
- **Memory**: Session-based persistence (partner profiles, chat analysis, transcripts)
- **Chat Parsing**: WhatsApp export `.txt` format
- **Framework**: Based on [fix-life-in-1-day](https://github.com/evgyur/fix-life-in-1-day) skill architecture

## Status

Early planning phase. Internal use first, potential scale later.

## References

- [Tavus LLM Integration Docs](https://docs.tavus.io/sections/conversational-video-interface/persona/llm)
- [fix-life-in-1-day Skill](https://github.com/evgyur/fix-life-in-1-day)
- [Building Real-Time AI with Pipecat and Tavus](https://www.tavus.io/post/open-sourcing-ai-innovation-building-real-time-ai-interactions-with-pipecat-and-tavus)
