from groq import Groq
from app.core.config import settings
from app.prompts.skill_income_prompt import get_skill_income_prompt
from app.utils.json_utils import parse_ai_json

client = Groq(api_key=settings.GROQ_API_KEY)


async def generate_skill_income_plan(
    skill: str,
    level: str,
    hours_per_week: float,
) -> dict:
    prompt = get_skill_income_prompt(skill, level, hours_per_week)
    raw = ""
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are AURORA's Skill-to-Income advisor. Respond ONLY with valid JSON. No markdown. Raw JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=2000,
        )
        raw = response.choices[0].message.content
        return parse_ai_json(raw)

    except Exception as e:
        if raw:
            return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw[:500]}
        return {"error": str(e)}