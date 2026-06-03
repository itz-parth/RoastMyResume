import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

from utils import extract_text_from_pdf
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
async def analyze(file: UploadFile = File(...)):
    
    raw_text = await extract_text_from_pdf(file)

    final = process_resume(client, raw_text)

    return final.model_dump()
