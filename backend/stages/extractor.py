from utils import extract_json, call_llm
from schemas import Stage1Output
from prompts.extract_prompt import SYSTEM_PROMPT, build_user_prompt
from openai import OpenAI


# tries to parse resume text into structured json, retries once if it fails
def run_stage1(
    client: OpenAI,
    raw_text: str,
    model: str = "llama-3.3-70b-versatile",
) -> Stage1Output | None:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": build_user_prompt(raw_text)},
    ]

    try:
        response = call_llm(client, model, messages, temperature=0.1)
        data = extract_json(response)
        return Stage1Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 1] First attempt failed: {e}")

    try:
        response = call_llm(client, model, messages, temperature=0.1)
        data = extract_json(response)
        return Stage1Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 1] Retry also failed: {e}")
        return None
