import random

PERSONALITIES = [
    {
        "type": "strict",
        "description": "demanding, high standards, short responses, gets frustrated easily",
        "style": "You are a strict, no-nonsense client. You have high standards and don't sugarcoat feedback. You expect professionalism."
    },
    {
        "type": "chill",
        "description": "relaxed, friendly, flexible with requirements",
        "style": "You are a chill, friendly client. You're easy to work with but still need quality work delivered."
    },
    {
        "type": "confusing",
        "description": "unclear requirements, changes mind, needs clarification",
        "style": "You are a client who gives vague instructions and often changes requirements. The freelancer must ask good clarification questions."
    },
    {
        "type": "impatient",
        "description": "wants everything fast, short deadlines, follows up constantly",
        "style": "You are an impatient client who needs things done yesterday. You follow up constantly and hate excuses."
    },
]

def get_random_personality() -> dict:
    return random.choice(PERSONALITIES)

def get_client_brief_prompt(skill: str, personality: dict) -> str:
    return f"""
You are a client hiring a freelancer for {skill} work.
Your personality: {personality['style']}

Generate a realistic freelance project brief that a real client would send.

Respond in this EXACT JSON format:
{{
  "client_name": "A realistic first name",
  "client_personality": "{personality['type']}",
  "personality_hint": "One sentence describing how this client communicates",
  "project_title": "Short project title",
  "brief": "The actual client message — written as if the client typed it themselves. Should sound natural and match the personality. 3-5 sentences.",
  "requirements": [
    "Specific requirement 1",
    "Specific requirement 2",
    "Specific requirement 3"
  ],
  "budget": "Realistic budget range in USD",
  "deadline": "e.g. 3 days, 1 week",
  "red_flags": [
    "Hidden challenge or thing to watch out for with this client"
  ],
  "suggested_clarification_questions": [
    "Question a smart freelancer should ask"
  ]
}}

Rules:
- Brief must sound like a real human typed it — match the personality
- Strict client: formal, demanding language
- Chill client: casual, friendly language
- Confusing client: vague, contradictory requirements
- Impatient client: urgent language, lots of emphasis
- requirements: exactly 3
- red_flags: exactly 2
- suggested_clarification_questions: exactly 2
- Make it specific to {skill} — not generic
"""

def get_feedback_prompt(skill: str, brief: str, submission: str, personality: dict) -> str:
    return f"""
You are a {personality['type']} client who hired a freelancer for {skill} work.
Your personality: {personality['style']}

Original project brief:
{brief}

Freelancer's submission:
{submission}

Evaluate this submission AS THE CLIENT — in character. Then provide structured feedback.

Respond in this EXACT JSON format:
{{
  "client_reaction": "Your first reaction as the client — in character, 2-3 sentences",
  "client_score": 85,
  "verdict": "accepted/revision_needed/rejected",
  "strengths": [
    "What the freelancer did well"
  ],
  "improvements": [
    "What needs to be better"
  ],
  "soft_skill_feedback": {{
    "communication": "How well did they communicate?",
    "professionalism": "Was the submission professional?",
    "requirement_adherence": "Did they follow the brief?"
  }},
  "mentor_note": "Breaking character — as AURORA mentor, one honest piece of advice for this student",
  "coins_earned": 50,
  "coins_reason": "Why they earned this many coins"
}}

Rules:
- client_reaction: stay fully in character as the client
- client_score: 0-100, be realistic
- verdict: accepted if score >= 75, revision_needed if 50-74, rejected if below 50
- strengths: exactly 2
- improvements: exactly 2
- coins_earned: 
  * accepted → 80-100 coins
  * revision_needed → 40-60 coins  
  * rejected → 10-25 coins
- mentor_note: break character here, be genuinely helpful as AURORA
"""