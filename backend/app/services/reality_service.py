import json
import re
from groq import Groq
from app.core.config import settings
from app.prompts.reality_prompt import get_reality_prompt

client = Groq(api_key=settings.GROQ_API_KEY)

def clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'```$', '', raw, flags=re.MULTILINE)
    raw = raw.strip()
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    return match.group(0) if match else raw

async def generate_reality_check(
    subject: str,
    planned_hours: float,
    actual_hours: float,
    exam_days: int
) -> dict:
    prompt = get_reality_prompt(subject, planned_hours, actual_hours, exam_days)

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are AURORA's Reality Mode. Respond ONLY with valid JSON. No markdown. Raw JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.75,
            max_tokens=1500,
        )

        raw = response.choices[0].message.content
        cleaned = clean_json(raw)
        return json.loads(cleaned)

    except json.JSONDecodeError as e:
        raw_preview = response.choices[0].message.content[:500]
        return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw_preview}
    except Exception as e:
        return {"error": str(e)}