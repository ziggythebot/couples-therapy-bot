<div align="center">

# Couples Therapy Bot

**AI-assisted relationship pattern discovery — beta PoC today, structured interviews and live sessions on the roadmap**

[![Status](https://img.shields.io/badge/Status-Beta%20PoC-blue)](https://github.com/ziggythebot/couples-therapy-bot)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[What’s in the repo](#whats-in-the-repo-now) • [Quick start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Overview

Long-term vision: make thoughtful relationship support more accessible—grounded in **Gottman Method** and **EFT**-style ideas (communication patterns, attachment, repair), delivered through structured interviews, behavioral signals from chat, and eventually real-time joint sessions.

**Today’s focus** is *relationship pattern discovery*: ingest interviews and/or WhatsApp exports, compute deterministic metrics, and generate a readable **`relationship-brief.md`** via an LLM. This is **not** a replacement for licensed therapy; see [SAFETY_POLICY.md](SAFETY_POLICY.md) for beta boundaries and disclaimers.

## Therapeutic foundation (design intent)

The documentation and prompts lean on:

- **Gottman-style** signals: conflict/repair language, balance, escalation cues in text
- **EFT-style** framing: attachment, cycles, emotional accessibility (more fully in planned interview flows)

Integrated live “therapy bot” behavior (Tavus avatar, joint sessions) remains **documented and staged**, not production-complete.

## Architecture (target flow)

### Four-phase product story

1. **Individual interviews (async)** — structured prompts per partner (`fix-life-in-1-day`-inspired session shape in the specs)
2. **WhatsApp chat analysis** — export parse + metrics + themes for the brief
3. **Follow-up interview** — targeted questions informed by chat (spec’d; not fully wired in the PoC CLI)
4. **Live joint session** — Tavus + LLM + transcripts (roadmap; see Tavus docs below)

### What’s in the repo *now*

| Area | Status |
|------|--------|
| **PoC CLI pipeline** (`npm run poc`) — intake + WhatsApp → metrics → `relationship-brief.md` | Implemented |
| **WhatsApp parser + metrics** | Implemented |
| **LLM brief** (OpenAI or Anthropic via env) | Implemented |
| **`apps/intake-web`** (Next.js) | Scaffold for intake UI |
| **`apps/session-api`** | API scaffold for sessions |
| **Tavus / LiveKit real-time** | Design docs only |
| **Full interview engine + follow-up generator** | Partially specified in markdown |

## Tech stack

- **Runtime:** Node.js 20+, TypeScript  
- **Monorepo:** npm workspaces (`apps/*`)  
- **LLM:** OpenAI or Anthropic SDKs (configurable)  
- **PoC I/O:** local filesystem under `memory/` (default)  
- **Chat input:** WhatsApp `.txt` export  

## Quick start

```bash
git clone https://github.com/ziggythebot/couples-therapy-bot.git
cd couples-therapy-bot
npm install
```

Set API credentials (brief generation needs at least one provider):

```bash
# Example: OpenAI
export OPENAI_API_KEY=sk-...
export LLM_PROVIDER=openai
# Or Anthropic:
# export ANTHROPIC_API_KEY=...
# export LLM_PROVIDER=anthropic
```

Run the PoC on the sample chat (writes under `./memory/relationship/` by default):

```bash
npm run poc -- --chat samples/whatsapp/sample-chat.txt
```

Optional: add intake transcripts and partner display names:

```bash
npm run poc -- \
  --intakeA samples/intake/sample-partner-a.json \
  --chat samples/whatsapp/sample-chat.txt \
  --partnerAName "Alex" \
  --partnerBName "Sam"
```

Other scripts: `npm run parse:chat`, `npm run typecheck`, `npm run dev:web` / `npm run dev:api` for the app workspaces.

## Project status

🟦 **Beta PoC** — core analysis path runs end-to-end; product packaging and real-time layers are still in progress.

- [x] PoC pipeline (intake + WhatsApp + metrics + brief)
- [x] WhatsApp parser (see [WHATSAPP_PARSER.md](WHATSAPP_PARSER.md))
- [x] Therapeutic framing and architecture docs
- [ ] Intake web + session API fully productized
- [ ] Tavus / real-time session integration
- [ ] Full interview engine + automated follow-up pass

Roadmap detail: [POC_ROADMAP.md](POC_ROADMAP.md).

## Documentation

| Doc | Purpose |
|-----|---------|
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | PoC modules, pipeline, CLI |
| [POC_ROADMAP.md](POC_ROADMAP.md) | Phases from pattern discovery to oversight |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design and memory layout |
| [SAFETY_POLICY.md](SAFETY_POLICY.md) | Beta boundaries and disclaimers |
| [INTERVIEW-STRUCTURE.md](INTERVIEW-STRUCTURE.md) | Interview/session structure (spec) |
| [WHATSAPP-ANALYSIS.md](WHATSAPP-ANALYSIS.md) | Chat analysis dimensions |
| [TAVUS-INTEGRATION.md](TAVUS-INTEGRATION.md) | Tavus + LLM integration notes |

## References

### Technical

- [Tavus LLM integration](https://docs.tavus.io/sections/conversational-video-interface/persona/llm)
- [fix-life-in-1-day](https://github.com/evgyur/fix-life-in-1-day) (interview structure inspiration)

### Therapeutic models

- [Gottman Method & EFT](https://www.gottman.com/blog/integrate-gottman-method-couples-therapy/)
- [Gottman research](https://www.gottman.com/about/research/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Research, interview copy, parser edge cases, and documentation cleanup are especially welcome.

## Ethical considerations

This project is intended to **supplement**, not replace, professional care. It is **not** appropriate as a crisis or safety system. Read [SAFETY_POLICY.md](SAFETY_POLICY.md). Treat relationship data as sensitive.

## Acknowledgments

- **Dan Koe** — [fix-life-in-1-day](https://github.com/evgyur/fix-life-in-1-day) architecture inspiration  
- **Dr. John Gottman** — Gottman Method  
- **Dr. Sue Johnson** — EFT  
- **Tavus** — avatar / CVI docs for future real-time work  

## License

MIT License — add a `LICENSE` file at the repository root when publishing if one is not yet present.

---

<div align="center">

**Built with care for clearer communication**

[Report an issue](https://github.com/ziggythebot/couples-therapy-bot/issues)

</div>
