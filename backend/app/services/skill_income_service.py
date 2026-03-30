import json
import re
from groq import Groq
from app.core.config import settings
from app.prompts.skill_income_prompt import get_skill_income_prompt

client = Groq(api_key=settings.GROQ_API_KEY)

def clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'```$', '', raw, flags=re.MULTILINE)
    raw = raw.strip()
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    return match.group(0) if match else raw

async def generate_skill_income_plan(
    skill: str,
    level: str,
    hours_per_week: float
) -> dict:
    prompt = get_skill_income_prompt(skill, level, hours_per_week)

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are AURORA's Skill-to-Income advisor. Respond ONLY with valid JSON. No markdown. Raw JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.8,
            max_tokens=2000,
        )

        raw = response.choices[0].message.content
        cleaned = clean_json(raw)
        return json.loads(cleaned)

    except json.JSONDecodeError as e:
        raw_preview = response.choices[0].message.content[:500]
        return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw_preview}
    except Exception as e:
        return {"error": str(e)}