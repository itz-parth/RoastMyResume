import io
import os

import pdfplumber
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

from schemas import FinalResponse
from stages.extractor import run_stage1
from stages.analyzer import run_stage2
from stages.roaster import run_stage3

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# using groq as the llm provider
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
)


def extract_text_from_pdf(content: bytes) -> str:
    """reads pdf bytes and returns plain text"""
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    if not text.strip():
        raise ValueError(
            "Could not extract text from PDF. Make sure it's a text-based PDF, not scanned."
        )
    return text


@app.get("/")
def home():
    return {"message": "API Running"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # only accept pdf files
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        raw_text = extract_text_from_pdf(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # stage 1 - extract structured data from raw text
    structured = run_stage1(client, raw_text)

    # stage 2 - analyze the resume
    analysis_input = structured.model_dump() if structured else raw_text
    analysis = run_stage2(client, analysis_input)

    if analysis is None:
        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed. Please try again.",
        )

    # stage 3 - generate the roast
    roast_input = structured.model_dump() if structured else {"sections": {}, "raw_observations": {}}
    roast = run_stage3(client, roast_input, analysis.model_dump())

    # build a short summary from first strength and weakness
    summary_parts = []
    if analysis.strengths:
        summary_parts.append(f"Strengths: {analysis.strengths[0]}")
    if analysis.weaknesses:
        summary_parts.append(f"Area to improve: {analysis.weaknesses[0]}")
    summary = " ".join(summary_parts) if summary_parts else "Analysis complete."

    # combine everything into the final response
    final = FinalResponse(
        ats_score=analysis.ats_score,
        score_breakdown=analysis.score_breakdown,
        opening_roast=roast.opening_roast if roast else "No roast generated.",
        summary=summary,
        strengths=analysis.strengths,
        weaknesses=analysis.weaknesses,
        missing_keywords=analysis.missing_keywords,
        improved_bullets=roast.improved_bullets if roast else [],
        section_feedback=analysis.section_feedback,
        quick_wins=roast.quick_wins if roast else [],
        final_verdict=roast.final_verdict if roast else "Analysis complete.",
        roast_level=roast.roast_level if roast else "medium",
    )

    return final.model_dump()
