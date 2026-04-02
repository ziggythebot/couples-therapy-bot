# WhatsApp Chat Parser

## Export Format

WhatsApp exports chats as `.txt` files with this format:

```
[DD/MM/YYYY, HH:MM:SS] Contact Name: Message text here
[DD/MM/YYYY, HH:MM:SS] Other Contact: Reply message
```

**Example**:
```
[15/04/2026, 10:23:45] Alice: Hey, can we talk about last night?
[15/04/2026, 10:45:12] Bob: Not right now, I'm at work
[15/04/2026, 11:02:33] Alice: You always say that
[15/04/2026, 14:32:10] Bob: I'm done for the day. What's up?
```

## Parsing Strategy

### 1. Extract Messages

```python
import re
from datetime import datetime

pattern = r'\[(\d{2}/\d{2}/\d{4}, \d{2}:\d{2}:\d{2})\] ([^:]+): (.+)'

def parse_chat(file_path):
    messages = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            match = re.match(pattern, line)
            if match:
                timestamp_str, sender, text = match.groups()
                timestamp = datetime.strptime(timestamp_str, '%d/%m/%Y, %H:%M:%S')
                messages.append({
                    'timestamp': timestamp,
                    'sender': sender,
                    'text': text
                })
    return messages
```

### 2. Identify Partners

```python
def identify_partners(messages):
    """
    Find the two most frequent senders (should be the couple)
    """
    from collections import Counter
    senders = Counter(msg['sender'] for msg in messages)
    return [sender for sender, _ in senders.most_common(2)]
```

### 3. Basic Stats

```python
def compute_stats(messages, partner_a, partner_b):
    total = len(messages)
    a_count = sum(1 for m in messages if m['sender'] == partner_a)
    b_count = sum(1 for m in messages if m['sender'] == partner_b)

    return {
        'total_messages': total,
        f'{partner_a}_messages': a_count,
        f'{partner_b}_messages': b_count,
        f'{partner_a}_percentage': (a_count / total) * 100,
        f'{partner_b}_percentage': (b_count / total) * 100
    }
```

## Analysis Dimensions

### 1. Initiation Patterns

Who starts conversations more often?

```python
def analyze_initiation(messages, gap_threshold_hours=4):
    """
    Consider a message an "initiation" if it comes after a gap
    """
    initiations = {partner_a: 0, partner_b: 0}

    for i, msg in enumerate(messages):
        if i == 0:
            initiations[msg['sender']] += 1
            continue

        prev = messages[i-1]
        time_gap = (msg['timestamp'] - prev['timestamp']).total_seconds() / 3600

        if time_gap > gap_threshold_hours:
            initiations[msg['sender']] += 1

    return initiations
```

### 2. Response Time

How long does each partner take to respond?

```python
def analyze_response_time(messages, partner_a, partner_b):
    """
    Calculate average response time for each partner
    """
    response_times = {partner_a: [], partner_b: []}

    for i in range(1, len(messages)):
        curr = messages[i]
        prev = messages[i-1]

        # If responding to the other person
        if curr['sender'] != prev['sender']:
            time_diff = (curr['timestamp'] - prev['timestamp']).total_seconds() / 60
            response_times[curr['sender']].append(time_diff)

    return {
        partner: {
            'avg_minutes': sum(times) / len(times) if times else 0,
            'median_minutes': sorted(times)[len(times)//2] if times else 0
        }
        for partner, times in response_times.items()
    }
```

### 3. Withdrawal Detection

Identify when someone stops responding or leaves the conversation.

```python
def detect_withdrawal(messages, partner_a, partner_b, withdrawal_threshold_hours=12):
    """
    Find instances where one person stops responding
    """
    withdrawals = []

    consecutive_from_sender = []
    current_sender = None

    for msg in messages:
        if msg['sender'] == current_sender:
            consecutive_from_sender.append(msg)
        else:
            # Check if previous sender sent multiple messages without response
            if len(consecutive_from_sender) >= 3:
                first = consecutive_from_sender[0]
                last = consecutive_from_sender[-1]
                gap = (last['timestamp'] - first['timestamp']).total_seconds() / 3600

                if gap > withdrawal_threshold_hours:
                    withdrawals.append({
                        'sender': current_sender,
                        'message_count': len(consecutive_from_sender),
                        'start': first['timestamp'],
                        'end': last['timestamp'],
                        'duration_hours': gap
                    })

            consecutive_from_sender = [msg]
            current_sender = msg['sender']

    return withdrawals
```

### 4. Conflict Detection

Look for patterns indicating conflict (keywords, rapid exchanges, late-night timing).

```python
def detect_conflicts(messages):
    """
    Identify potential conflict exchanges
    """
    conflict_keywords = ['always', 'never', 'you always', 'you never',
                        'fine', 'whatever', 'forget it', 'not right now']

    conflicts = []

    for i in range(len(messages) - 1):
        msg = messages[i]
        next_msg = messages[i+1]

        # Rapid back-and-forth (< 5 min apart)
        time_gap = (next_msg['timestamp'] - msg['timestamp']).total_seconds() / 60

        # Contains conflict keywords
        has_keywords = any(keyword in msg['text'].lower() for keyword in conflict_keywords)

        # Late night (after 10pm)
        is_late_night = msg['timestamp'].hour >= 22 or msg['timestamp'].hour <= 2

        if (time_gap < 5 and has_keywords) or (is_late_night and has_keywords):
            conflicts.append({
                'timestamp': msg['timestamp'],
                'sender': msg['sender'],
                'text': msg['text'],
                'context': [messages[max(0, i-2):min(len(messages), i+3)]]
            })

    return conflicts
```

### 5. Repair Attempts

Identify attempts to de-escalate or repair after conflict.

```python
def detect_repairs(messages, conflicts):
    """
    Look for repair attempts after conflicts
    """
    repair_keywords = ['sorry', 'my bad', 'i love you', 'can we talk',
                      'i didn\'t mean', 'let\'s', 'appreciate']

    repairs = []

    for conflict in conflicts:
        conflict_time = conflict['timestamp']

        # Check next 10 messages after conflict
        conflict_idx = next(i for i, m in enumerate(messages) if m['timestamp'] == conflict_time)

        for msg in messages[conflict_idx+1:conflict_idx+11]:
            if any(keyword in msg['text'].lower() for keyword in repair_keywords):
                repairs.append({
                    'conflict': conflict,
                    'repair': msg,
                    'time_to_repair_hours': (msg['timestamp'] - conflict_time).total_seconds() / 3600
                })
                break

    return repairs
```

## Output Format

Structured markdown report:

```markdown
# WhatsApp Chat Analysis

**Period**: [first date] to [last date]
**Total Messages**: X
**Duration**: Y days

## Communication Balance

- Partner A: X messages (Y%)
- Partner B: X messages (Y%)

## Initiation Patterns

Partner A initiates conversations X% of the time
Partner B initiates conversations Y% of the time

## Response Times

- Partner A: Avg X minutes, Median Y minutes
- Partner B: Avg X minutes, Median Y minutes

## Withdrawal Episodes

Found X instances where one partner stopped responding:

1. [Date/Time] - Partner A sent 5 messages over 8 hours without response
2. ...

## Conflict Detection

Identified X potential conflict exchanges:

1. [Date/Time] - [Context snippet]
2. ...

## Repair Patterns

Found X repair attempts after conflicts:
- Average time to repair: Y hours
- Most common repair approach: [keyword/pattern]

## Temporal Patterns

- Most active time: [time range]
- Least active time: [time range]
- Conflict-prone times: [times when conflicts cluster]

## Key Insights

1. [Pattern 1 identified]
2. [Pattern 2 identified]
3. [Pattern 3 identified]
```

## Next Steps

1. Implement parser in Python
2. Add sentiment analysis (via Claude API for nuanced understanding)
3. Build report generator
4. Create follow-up question generator based on analysis
