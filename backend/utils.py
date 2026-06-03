import json
import re
from typing import Any


# extracts json from llm responses, handles markdown code blocks
def extract_json(text: str) -> dict[str, Any]:
    text = re.sub(r"```json|```", "", text).strip()
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end <= start:
        raise ValueError("No JSON object found in the LLM response")
    json_text = text[start:end]
    return json.loads(json_text)


# sends a chat request and returns the response text
def call_llm(client, model: str, messages: list, temperature: float = 0.3) -> str:
    completion = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )
    return completion.choices[0].message.content
