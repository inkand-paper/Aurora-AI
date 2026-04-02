from groq import Groq
from app.core.config import settings
from app.prompts.last_night_prompt import get_last_night_prompt
from app.utils.json_utils import parse_ai_json

client = Groq(api_key=settings.GROQ_API_KEY)


async def generate_last_night_plan(subject: str, hours: float) -> dict:
    prompt = get_last_night_prompt(subject, hours)
    raw = ""
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are AURORA. Respond ONLY with valid JSON. No markdown. Raw JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2500,
        )
        raw = response.choices[0].message.content
        return parse_ai_json(raw)

    except Exception as e:
        # If raw was populated before the error, include a preview for debugging
        if raw:
            return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw[:500]}
        return {"error": str(e)}