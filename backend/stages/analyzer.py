from utils import extract_json, call_llm
from schemas import Stage2Output
from prompts.analyze_prompt import SYSTEM_PROMPT, build_user_prompt
from openai import OpenAI


# takes structured data or raw text and returns ats scores, strengths, weaknesses
def run_stage2(
    client: OpenAI,
    resume_data: dict | str,
    model: str = "llama-3.3-70b-versatile",
) -> Stage2Output | None:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": build_user_prompt(resume_data)},
    ]

    try:
        response = call_llm(client, model, messages, temperature=0.3)
        data = extract_json(response)
        return Stage2Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 2] First attempt failed: {e}")

    try:
        response = call_llm(client, model, messages, temperature=0.3)
        data = extract_json(response)
        return Stage2Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 2] Retry also failed: {e}")
        return None
