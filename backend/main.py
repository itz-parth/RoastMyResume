import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from openai import OpenAI

from utils import extract_text
from services.resume_service import process_resume

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
)


@app.post("/analyze")
@limiter.limit("5/minute")
async def analyze(
    request: Request,
    file: UploadFile = File(...),
    job_description: str = Form(""),
):
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB.")

    raw_text = await extract_text(file)

    final = process_resume(client, raw_text, job_description or None)

    return final.model_dump()
