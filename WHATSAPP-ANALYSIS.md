# WhatsApp Chat Analysis

## Export Format

WhatsApp exports chats as `.txt` files with this format:

```
[DD/MM/YYYY, HH:MM:SS] Sender Name: Message text
[DD/MM/YYYY, HH:MM:SS] Sender Name: Message text
```

## Parsing Strategy

1. **Extract messages**:
   - Timestamp
   - Sender
   - Message text
   - Media attachments (noted but not analyzed)

2. **Normalize**:
   - Convert timestamps to ISO format
   - Identify Partner A vs Partner B
   - Handle multi-line messages
   - Filter system messages (joined, left, changed subject)

## Analysis Dimensions

### 1. Communication Patterns

- **Initiation**: Who starts conversations?
- **Response time**: Average delay between messages
- **Message length**: Brevity vs detail
- **Question asking**: Who asks more questions?
- **Active listening signals**: Acknowledgment, paraphrasing

### 2. Conflict Dynamics

- **Escalation triggers**: Topics that lead to conflict
- **Escalation patterns**: How arguments intensify
- **De-escalation**: Who attempts to calm, how
- **Repair attempts**: Apologies, humor, affection
- **Stonewalling**: Withdrawal patterns, silence duration

### 3. Temporal Patterns

- **Frequency**: Messages per day/week
- **Time of day**: When most communication happens
- **Gaps**: Extended silences (potential conflict aftermath)
- **Consistency**: Regular vs sporadic communication

### 4. Emotional Tone

- **Sentiment analysis**: Positive, negative, neutral
- **Emotional keywords**: Love, anger, frustration, joy
- **Emoji usage**: Frequency, type, sentiment
- **Caps lock**: Intensity indicators

### 5. Recurring Themes

- **Topics**: Most discussed subjects
- **Complaints**: Repeated grievances
- **Unresolved issues**: Topics that resurface
- **Avoidance**: Topics that are dodged

## Output Structure

### `chat-analysis.md`

```markdown
# WhatsApp Chat Analysis

## Overview
- Date range: [start] to [end]
- Total messages: [count]
- Partner A messages: [count]
- Partner B messages: [count]

## Communication Patterns

### Initiation
[Who initiates more? Percentages, examples]

### Response Time
[Average delay, patterns by partner]

### Message Length
[Average words per message by partner]

## Conflict Dynamics

### Escalation Triggers
[Topics that lead to conflict, frequency]

### Escalation Patterns
[How arguments intensify, examples]

### Repair Attempts
[Who attempts repairs, success rate]

## Temporal Patterns

### Frequency
[Messages per day, trends over time]

### Gaps
[Extended silences, dates, duration]

## Emotional Tone

### Sentiment Distribution
[Positive/negative/neutral percentages]

### Key Emotional Moments
[High/low points with examples]

## Recurring Themes

### Top Topics
1. [Topic] - [frequency]
2. [Topic] - [frequency]

### Unresolved Issues
[Issues that resurface repeatedly]

## Insights

[Key behavioral patterns identified]

## Follow-up Questions

[Targeted questions for interview phase]
```

## Implementation

### Option 1: Python Script

```python
import re
from datetime import datetime
from collections import Counter

def parse_whatsapp_chat(file_path):
    pattern = r'\[(\d{2}/\d{2}/\d{4}, \d{2}:\d{2}:\d{2})\] ([^:]+): (.+)'
    messages = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            match = re.match(pattern, line)
            if match:
                timestamp, sender, text = match.groups()
                messages.append({
                    'timestamp': datetime.strptime(timestamp, '%d/%m/%Y, %H:%M:%S'),
                    'sender': sender.strip(),
                    'text': text.strip()
                })
    
    return messages

def analyze_patterns(messages):
    # Implement analysis logic
    pass
```

### Option 2: LLM-based Analysis

Feed entire chat history to Claude with structured prompt:
- "Analyze this WhatsApp chat between two partners"
- "Identify communication patterns, conflict dynamics, emotional tone"
- "Output structured analysis in markdown"

**Pros**: Rich qualitative insights
**Cons**: Token cost for long chats (consider chunking)

## Next Steps

1. Build parser (Python script or Node.js)
2. Define analysis prompts for LLM
3. Test with sample WhatsApp exports
4. Generate structured output
5. Integrate with interview phase (use analysis to generate follow-up questions)
