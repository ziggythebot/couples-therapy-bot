# Tavus Integration Notes

## Overview

Tavus supports custom LLM backends including Claude. Integration is via OpenAI-compatible API.

## Requirements

- OpenAI-compatible API endpoint
- Streaming support (SSE)
- Base URL + API key

## Configuration

```json
{
  "model": "claude-sonnet-4.5",
  "base_url": "https://api.anthropic.com/v1",
  "api_key": "sk-ant-..."
}
```

## Supported Models (as of Feb 2026)

- Anthropic Claude Sonnet
- OpenAI GPT-4o, GPT-4o mini
- Llama (via Together AI, Fireworks AI)
- Google Gemini (via Pipecat)

## Session Recording

Tavus can record sessions and save to S3:
- Audio/video recordings
- Transcripts available via API
- Export to external storage

## Real-Time Flow

```
User (audio) → Tavus → Claude API (streaming) → Tavus → User (avatar video)
                                    ↓
                            Session transcript
```

## Latency Considerations

- Claude can take 5-30s for complex reasoning
- Tavus expects synchronous responses for conversational flow
- **Solutions**:
  - Use streaming responses (chunk by chunk)
  - Fast acknowledgments + deeper follow-ups
  - Optimize system prompts for speed

## Context Management

- System prompt can include partner profiles, chat analysis
- Context loaded at session start
- Session goals defined upfront
- Transcripts saved for future reference

## References

- [Tavus LLM Integration](https://docs.tavus.io/sections/conversational-video-interface/persona/llm)
- [Building Real-Time AI with Pipecat and Tavus](https://www.tavus.io/post/open-sourcing-ai-innovation-building-real-time-ai-interactions-with-pipecat-and-tavus)
- [Using Llama 3 8B with Tavus](https://www.tavus.io/post/using-llama-3-8b-to-power-your-conversational-ai)
- [Custom AI Personality Building](https://www.tavus.io/post/build-a-custom-personality-for-real-time-video-ai)
