"""
Interview phase definitions for the intake session.
Each phase has a system prompt and a list of questions the agent works through.
The agent moves to the next phase when the LLM signals phase completion.
"""

SYSTEM_PROMPT = """
You are a warm, professional intake interviewer for a couples therapy service.
Your goal is to help one partner share their perspective on the relationship — not to judge,
advise, or take sides. Ask one question at a time. Listen carefully before moving on.
Keep your tone calm, curious, and supportive.

When you have gathered enough on the current topic, say exactly:
  [PHASE_COMPLETE]
to signal you are ready to move to the next section.

Do NOT say [PHASE_COMPLETE] until you have asked at least the key questions for the current phase.
""".strip()

PHASES = [
    {
        "name": "intro_and_consent",
        "intro": (
            "Hi, I'm here to help gather some background about your relationship. "
            "Everything you share today is confidential and will only be used to "
            "help support the two of you. This should take about 20-30 minutes. "
            "Before we begin — do you have any questions, and are you comfortable proceeding?"
        ),
        "key_questions": [
            "Can you tell me a little about yourself and how long you and your partner have been together?",
            "What brought you to seek support at this time?",
        ],
    },
    {
        "name": "relationship_baseline",
        "intro": "Thank you. Now I'd like to understand your relationship a bit better.",
        "key_questions": [
            "How would you describe the strengths of your relationship?",
            "What does a typical good day look like between the two of you?",
            "Are there patterns or dynamics that you'd like to change?",
        ],
    },
    {
        "name": "conflict_and_triggers",
        "intro": "I'd like to ask about some of the harder moments now, if that's okay.",
        "key_questions": [
            "Can you describe a recent conflict or disagreement that felt significant?",
            "How do arguments usually start, and how do they typically end?",
            "Are there topics that feel especially difficult or charged between you two?",
            "How do you each tend to react when things get heated?",
        ],
    },
    {
        "name": "reflection_close",
        "intro": "We're almost done. I just have a few closing questions.",
        "key_questions": [
            "What are your hopes for this process?",
            "Is there anything important about your relationship that you haven't had a chance to share?",
            "What would a meaningful improvement look like to you, six months from now?",
        ],
    },
]
