<div align="center">

# Couples Therapy Bot

**AI-powered couples therapy combining structured interviews, communication analysis, and real-time sessions**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Planning-yellow)](https://github.com/ziggythebot/couples-therapy-bot)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Architecture](#architecture) • [Therapeutic Foundation](#therapeutic-foundation) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Overview

Designed to make high-quality couples therapy accessible—replicating the experience that would cost **$200+/hour** in cities like London or New York.

This system integrates evidence-based therapeutic models (Gottman Method + EFT) with modern AI technology to provide structured relationship support through asynchronous interviews, behavioral analysis, and real-time joint sessions.

## Therapeutic Foundation

This system integrates evidence-based therapeutic models:

### **Gottman Method** (Behavioral & Communication Focus)
- **Four Horsemen Analysis**: Identifying criticism, contempt, defensiveness, stonewalling in communication
- **Sound Relationship House**: Building friendship, managing conflict, creating shared meaning
- **Conflict Management**: Distinguishing solvable vs perpetual problems
- **Repair Attempts**: Recognizing and strengthening de-escalation patterns
- **Behavioral Research**: 40+ years of empirical data on what predicts relationship success/failure

### **Emotionally Focused Therapy (EFT)** (Attachment & Emotion Focus)
- **Attachment Theory**: Understanding attachment styles, bonding patterns, security needs
- **Emotional Accessibility**: Helping partners express vulnerable emotions beneath conflict
- **Negative Cycles**: Mapping pursue-withdraw, attack-defend patterns
- **Reprocessing Interactions**: Creating new emotional experiences in real-time
- **Trauma-Informed**: Addressing past wounds affecting current relationship dynamics

### **Integrated Approach**
The bot combines both models:
- **Gottman's structure** for skill-building, assessment, and conflict analysis
- **EFT's depth** for emotional safety, attachment repair, and vulnerability work
- WhatsApp chat analysis provides behavioral data (Gottman-style)
- Individual interviews explore attachment patterns (EFT-style)
- Live sessions blend skill coaching with emotional processing

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

## Quick Start

> **Note**: This project is in early planning phase. No implementation yet.

```bash
# Clone the repository
git clone https://github.com/ziggythebot/couples-therapy-bot.git
cd couples-therapy-bot

# Read the architecture
cat ARCHITECTURE.md
```

## Project Status

🟡 **Early Planning Phase**

- [x] Architectural design complete
- [x] Therapeutic models researched (Gottman + EFT)
- [x] Technical stack defined (Claude + Tavus)
- [ ] Interview structure implementation
- [ ] WhatsApp parser development
- [ ] Tavus integration
- [ ] Memory system implementation

**Roadmap**: Internal use first, potential scale later

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, components, memory structure, flow diagrams
- **[TAVUS-INTEGRATION.md](TAVUS-INTEGRATION.md)** - Tavus AI avatar + Claude backend integration
- **[INTERVIEW-STRUCTURE.md](INTERVIEW-STRUCTURE.md)** - Session templates, state management, question flows
- **[WHATSAPP-ANALYSIS.md](WHATSAPP-ANALYSIS.md)** - Chat parsing strategy, analysis dimensions

## References

### Technical
- [Tavus LLM Integration Docs](https://docs.tavus.io/sections/conversational-video-interface/persona/llm)
- [fix-life-in-1-day Skill](https://github.com/evgyur/fix-life-in-1-day) (interview structure inspiration)
- [Building Real-Time AI with Pipecat and Tavus](https://www.tavus.io/post/open-sourcing-ai-innovation-building-real-time-ai-interactions-with-pipecat-and-tavus)

### Therapeutic Models
- [Gottman Method & EFT Integration](https://www.gottman.com/blog/integrate-gottman-method-couples-therapy/)
- [EFT vs Gottman: Comparison](https://familytherapybasics.com/blog/are-gottman-method-and-emotionally-focused-therapy-compatible)
- [Gottman Method Research](https://www.gottman.com/about/research/)

## License

MIT
