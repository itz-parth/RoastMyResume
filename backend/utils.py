import io
import json
import re
from typing import Any

import pdfplumber
from fastapi import HTTPException, UploadFile


def extract_json(text: str) -> dict[str, Any]:
    text = re.sub(r"```json|```", "", text).strip()

    start = text.find("{")
    end = text.rfind("}") + 1

    if start == -1 or end <= start:
        raise ValueError("No JSON object found in the LLM response")

    return json.loads(text[start:end])


def call_llm(
    client,
    model: str,
    messages: list,
    temperature: float = 0.3,
) -> str:
    completion = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )

    return completion.choices[0].message.content


async def extract_text_from_pdf(file: UploadFile) -> str:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty",
        )

    text_parts = []

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()

            if extracted:
                text_parts.append(extracted)

    text = "\n".join(text_parts)

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF. Make sure it's a text-based PDF, not scanned.",
        )

    return text