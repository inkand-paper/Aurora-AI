import json
import re
from groq import Groq
from app.core.config import settings
from app.prompts.last_night_prompt import get_last_night_prompt

client = Groq(api_key=settings.GROQ_API_KEY)

def clean_json_response(raw: str) -> str:
    # Remove markdown code blocks
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'```$', '', raw, flags=re.MULTILINE)
    raw = raw.strip()
    return raw

async def generate_last_night_plan(subject: str, hours: float) -> dict:
    prompt = get_last_night_prompt(subject, hours)

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are AURORA. Respond ONLY with a valid JSON object. No markdown. No explanation. No code blocks. Raw JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        raw = response.choices[0].message.content
        cleaned = clean_json_response(raw)

        # Find JSON object in response even if there's surrounding text
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            cleaned = match.group(0)

        result = json.loads(cleaned)
        return result

    except json.JSONDecodeError as e:
        # Return raw so you can see what AI actually said
        raw_preview = response.choices[0].message.content[:500]
        return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw_preview}
    except Exception as e:
        return {"error": str(e)}