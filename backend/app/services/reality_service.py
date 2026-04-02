from groq import Groq
from app.core.config import settings
from app.prompts.reality_prompt import get_reality_prompt
from app.utils.json_utils import parse_ai_json

client = Groq(api_key=settings.GROQ_API_KEY)


async def generate_reality_check(
    subject: str,
    planned_hours: float,
    actual_hours: float,
    exam_days: int,
) -> dict:
    prompt = get_reality_prompt(subject, planned_hours, actual_hours, exam_days)
    raw = ""
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are AURORA's Reality Mode. Respond ONLY with valid JSON. No markdown. Raw JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.75,
            max_tokens=1500,
        )
        raw = response.choices[0].message.content
        result = parse_ai_json(raw)

        # ── Derived gamification fields (always present) ──────────────────
        completion_rate_raw = result.get("completion_rate", 0)
        try:
            completion_rate = float(completion_rate_raw)
        except (TypeError, ValueError):
            completion_rate = 0.0

        consistency_score = int(round(max(0.0, min(100.0, completion_rate))))

        # Map predicted grade to a numeric trend score
        predicted_grade = (result.get("performance_prediction") or "").strip().upper()
        grade_to_trend: dict[str, int] = {"A": 95, "B": 85, "C": 70, "D": 55, "F": 30}
        trend_score = grade_to_trend.get(predicted_grade, consistency_score)

        academic_reality_score = int(round(0.6 * consistency_score + 0.4 * trend_score))

        if consistency_score >= 75:
            risk_indicator = "low"
        elif consistency_score >= 50:
            risk_indicator = "medium"
        else:
            risk_indicator = "high"

        result["consistency_score"]      = consistency_score
        result["academic_reality_score"] = academic_reality_score
        result["risk_indicator"]         = risk_indicator

        return result

    except Exception as e:
        if raw:
            return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw[:500]}
        return {"error": str(e)}