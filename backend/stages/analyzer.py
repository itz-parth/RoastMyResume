from utils import extract_json, call_llm
from schemas import Stage2Output
from prompts.analyze_prompt import get_system_prompt, build_user_prompt
from openai import OpenAI


# takes structured data or raw text and returns ats scores, strengths, weaknesses
def run_stage2(
    client: OpenAI,
    resume_data: dict | str,
    job_description: str = None,
    model: str = "llama-3.3-70b-versatile",
) -> Stage2Output | None:
    messages = [
        {"role": "system", "content": get_system_prompt(job_description)},
        {"role": "user", "content": build_user_prompt(resume_data, job_description)},
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
