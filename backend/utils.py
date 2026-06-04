import io
import json
import re
from typing import Any

import pypdf
import docx
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


async def extract_text(file: UploadFile) -> str:
    filename = file.filename.lower()

    content = await file.read()
    text = ''

    try:
        if filename.endswith(".pdf"):
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"

        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join([para.text for para in doc.paragraphs])

        elif filename.endswith(".txt"):
            text = content.decode("utf-8")

        else:
            raise HTTPException(
                status_code = 400,
                detail = "Unsupported format. Please upload PDF, DOCX, or TXT."
            ) 

    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail = f"Error reading file: {str(e)}"
        )

    if not text.strip():
        raise HTTPException(
            status_code =   400,
            details = "Could not extract text. If this is a scanned/image-based document, please upload a text-based file."
        )

    return text