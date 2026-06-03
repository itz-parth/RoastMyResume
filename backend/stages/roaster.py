from utils import extract_json, call_llm
from schemas import Stage3Output
from prompts.roast_prompt import SYSTEM_PROMPT, build_user_prompt
from openai import OpenAI


# generates roast text, improved bullets, and quick wins from the analysis
def run_stage3(
    client: OpenAI,
    structured_resume: dict,
    analysis: dict,
    model: str = "llama-3.3-70b-versatile",
) -> Stage3Output | None:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": build_user_prompt(structured_resume, analysis)},
    ]

    try:
        response = call_llm(client, model, messages, temperature=0.6)
        data = extract_json(response)
        return Stage3Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 3] First attempt failed: {e}")

    try:
        response = call_llm(client, model, messages, temperature=0.6)
        data = extract_json(response)
        return Stage3Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 3] Retry also failed: {e}")
        return None
