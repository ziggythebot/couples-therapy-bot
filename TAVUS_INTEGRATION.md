# Tavus Integration Notes

## Custom LLM Backend Support

Tavus supports connecting custom OpenAI-compatible LLMs as the backend for conversational video.

**Requirements**:
- OpenAI-compatible API endpoint
- Streaming support (SSE)
- Model name, base URL, API key

**Supported Models** (as of Feb 2026):
- Anthropic Claude Sonnet ✅
- OpenAI GPT-4o
- Llama (via Together AI, Fireworks AI)
- Google Gemini

## Integration Steps

1. **Create Tavus Persona**
   - Define avatar appearance
   - Set conversational style/personality
   - Configure custom LLM connection

2. **Configure Claude Backend**
   ```json
   {
     "model": "claude-sonnet-4-5",
     "baseURL": "https://api.anthropic.com/v1",
     "apiKey": "sk-ant-..."
   }
   ```

3. **Load Context Before Session**
   - System prompt includes full couple context
   - Partner A profile
   - Partner B profile
   - Chat analysis
   - Previous session summaries

4. **Session Flow**
   - User joins Tavus session URL
   - Audio/video streamed with avatar
   - Speech → transcript → Claude API
   - Claude response streamed back
   - Avatar speaks response
   - Session recorded to S3

## Session Recording

**Tavus Features**:
- Audio/video recording to S3
- Real-time transcription
- Session replay
- Export capabilities

**Our Use**:
- Save transcripts to `memory/sessions/`
- Update partner profiles with insights
- Track progress over time

## Time-Boxed Sessions

**15-30 Minute Format**:
- Hard stop at time limit
- Warning at 5 minutes remaining
- Summary generation at end
- Action items extracted

## Context Management

**Context Size Considerations**:
- Full context loaded in system prompt
- ~10-20k tokens per session start
- Claude 200k context window = plenty of room
- Previous sessions summarized to save tokens

## Pipecat Integration

Alternative approach using open-source [Pipecat](https://www.pipecat.ai/):
- More control over pipeline
- Direct WebRTC handling
- Custom audio processing
- Self-hosted option

**Trade-offs**:
- Tavus: Easier, hosted, avatar generation included
- Pipecat: More flexible, self-hosted, requires more setup

## Cost Estimates

**Per 30-Minute Session**:
- Tavus: ~$1-2 per session
- Claude API: ~$0.50-1.00 (streaming tokens)
- Total: ~$2-3 per session

**Scale Considerations**:
- Internal use: negligible cost
- 100 sessions/month: ~$200-300/month
- 1000 sessions/month: ~$2000-3000/month

## References

- [Tavus LLM Integration Docs](https://docs.tavus.io/sections/conversational-video-interface/persona/llm)
- [Building Real-Time AI with Pipecat and Tavus](https://www.tavus.io/post/open-sourcing-ai-innovation-building-real-time-ai-interactions-with-pipecat-and-tavus)
- [Using Custom LLMs with Tavus](https://www.tavus.io/post/using-llama-3-8b-to-power-your-conversational-ai)
