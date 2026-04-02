import json
import re


def clean_json(raw: str) -> str:
    """
    Extract the first valid JSON object from a model response.
    Handles markdown code fences (```json ... ```) and extra surrounding text.
    """
    raw = raw.strip()
    # Remove opening markdown fence with optional language tag
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE | re.MULTILINE)
    # Remove closing markdown fence
    raw = re.sub(r"\s*```\s*$", "", raw, flags=re.MULTILINE)

    # Find the JSON object boundaries
    start = raw.find("{")
    end   = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        return raw[start : end + 1]
    return raw


def parse_ai_json(raw: str) -> dict:
    """
    Clean and parse a raw LLM response string into a dict.
    Raises json.JSONDecodeError on parse failure (caller handles it).
    """
    return json.loads(clean_json(raw))
