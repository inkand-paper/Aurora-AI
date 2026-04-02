def get_analogy_prompt(topic: str, subject: str, mode: str) -> str:
    mode = (mode or "teacher").strip().lower()
    mode_instructions = {
        "funny": "Use light humor and playful phrasing. Make the student smile while staying accurate.",
        "story": "Write it like a short, relatable story (2-3 sentences) where the analogy naturally appears.",
        "teacher": "Explain like a patient teacher. Keep the analogies clear and structured, with gentle guidance.",
        "savage": "Use a playful 'tough love' tone (not insulting). Call out confusion directly but keep it respectful.",
    }.get(mode, "Use a patient teacher tone. Keep it clear and structured.");

    return f"""
You are AURORA's Analogy Engine. A student is struggling to understand "{topic}" from {subject}.

Your job is to make this concept click INSTANTLY using real-life analogies.
Selected analogy mode: {mode_instructions}

Respond in this EXACT JSON format:
{{
  "topic": "{topic}",
  "subject": "{subject}",
  "simple_definition": "One sentence. Plain English. No jargon.",
  "analogies": [
    {{
      "title": "Short catchy title for this analogy",
      "scenario": "Real life situation everyone knows",
      "explanation": "How this maps to the concept (2-3 sentences)",
      "memorable_line": "One punchy sentence the student will never forget"
    }}
  ],
  "common_mistakes": [
    "Mistake students make when thinking about this"
  ],
  "exam_tip": "One specific tip for answering exam questions on this topic"
}}

Rules:
- Give exactly 2 analogies
- Use situations from daily life: food, sports, money, social media, traffic, relationships
- Never use technical language in the analogies
- The memorable_line must be something a student would tell their friend
- common_mistakes: exactly 2 mistakes
- Be creative. Boring analogies don't help anyone.
- The writing style of scenario/explanation/memorable_line must match the selected mode
"""