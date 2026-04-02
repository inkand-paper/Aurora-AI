import random
from groq import Groq
from sqlalchemy.orm import Session
from app.core.config import settings
from app.prompts.client_prompt import (
    get_random_personality,
    get_client_brief_prompt,
    get_feedback_prompt,
    PERSONALITIES,
)
from app.models.coins import Coins, CoinsTransaction
from app.utils.json_utils import parse_ai_json

client = Groq(api_key=settings.GROQ_API_KEY)


async def generate_client_brief(skill: str) -> dict:
    personality = get_random_personality()
    prompt      = get_client_brief_prompt(skill, personality)
    raw = ""
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a realistic freelance client. Respond ONLY with valid JSON. No markdown."},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.9,
            max_tokens=1500,
        )
        raw  = response.choices[0].message.content
        data = parse_ai_json(raw)
        data["_personality"] = personality   # store for feedback later
        return data
    except Exception as e:
        if raw:
            return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw[:500]}
        return {"error": str(e)}


async def evaluate_submission(
    skill: str,
    brief: str,
    submission: str,
    personality_type: str,
    user_id: int,
    db: Session,
) -> dict:
    personality = next(
        (p for p in PERSONALITIES if p["type"] == personality_type),
        PERSONALITIES[0],
    )

    prompt = get_feedback_prompt(skill, brief, submission, personality)
    raw = ""
    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are evaluating a freelancer submission. Respond ONLY with valid JSON. No markdown."},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.75,
            max_tokens=1500,
        )
        raw    = response.choices[0].message.content
        result = parse_ai_json(raw)

        # Award coins
        coins_earned_raw = result.get("coins_earned", 30)
        try:
            coins_earned = int(coins_earned_raw)
        except (TypeError, ValueError):
            coins_earned = 30
        result["coins_earned"] = coins_earned

        award_coins(
            db,
            user_id,
            coins_earned,
            f"AI Client Mode — {result.get('verdict', 'completed')}",
        )
        result["new_balance"] = get_balance(db, user_id)

        return result
    except Exception as e:
        if raw:
            return {"error": f"JSON parse failed: {str(e)}", "raw_response": raw[:500]}
        return {"error": str(e)}


def get_balance(db: Session, user_id: int) -> int:
    coins = db.query(Coins).filter(Coins.user_id == user_id).first()
    return coins.balance if coins else 0


def award_coins(db: Session, user_id: int, amount: int, reason: str) -> None:
    coins = db.query(Coins).filter(Coins.user_id == user_id).first()
    if not coins:
        coins = Coins(user_id=user_id, balance=0)
        db.add(coins)
        db.flush()
    coins.balance += amount

    tx = CoinsTransaction(user_id=user_id, amount=amount, reason=reason)
    db.add(tx)
    db.commit()