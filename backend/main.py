import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

from utils import extract_text
from services.resume_service import process_resume

load_dotenv()
app = FastAPI()

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
async def analyze(file: UploadFile = File(...), job_description: str = Form("")):
    
    raw_text = await extract_text(file)

    final = process_resume(client, raw_text, job_description or None)

    return final.model_dump()
