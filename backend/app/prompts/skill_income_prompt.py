def get_skill_income_prompt(skill: str, level: str, hours_per_week: float) -> str:
    return f"""
You are AURORA's Skill-to-Income advisor. A student wants to monetize their skills.

Student profile:
- Skill: {skill}
- Level: {level} (beginner/intermediate/advanced)
- Available hours per week: {hours_per_week}

Respond in this EXACT JSON format:
{{
  "skill": "{skill}",
  "level": "{level}",
  "income_potential": {{
    "minimum": "$ amount per month realistically",
    "maximum": "$ amount per month at full potential",
    "timeline": "How long to first income"
  }},
  "earning_paths": [
    {{
      "path": "Name of earning method",
      "platform": "Where to do this",
      "how_it_works": "One sentence explanation",
      "realistic_earning": "$ range per month",
      "difficulty": "easy/medium/hard",
      "best_for": "What type of person this suits"
    }}
  ],
  "seven_day_plan": [
    {{
      "day": 1,
      "task": "Specific action to take",
      "time_needed": "X hours",
      "outcome": "What you'll have at end of day"
    }}
  ],
  "first_client_strategy": "Exactly how to get your first paying client or project",
  "biggest_mistake": "The #1 mistake students make when trying to monetize this skill"
}}

Rules:
- earning_paths: exactly 3 paths, ordered from easiest to hardest
- seven_day_plan: all 7 days, realistic for {hours_per_week} hours/week
- Be specific with platforms: Fiverr, Upwork, Toptal, YouTube, Gumroad etc.
- income numbers must be realistic for a student just starting out
- first_client_strategy must be actionable in 24 hours
"""