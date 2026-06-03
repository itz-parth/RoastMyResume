# Multi-Stage Resume Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single LLM call with a 3-stage pipeline (Structure → Analyze → Roast) to produce deeply insightful, specific, and entertaining resume analysis.

**Architecture:**
- Stage 1: Extract raw PDF text into structured JSON (sections, roles, dates, bullets)
- Stage 2: Analyze structured data against a weighted rubric → ATS score, strengths, weaknesses, keyword gaps
- Stage 3: Generate roasts, bullet rewrites, and verdicts grounded in the analysis
- Pydantic validation + auto-retry at each stage; fallback to raw text if Stage 1 fails

**Tech Stack:** FastAPI, Groq (Llama 3.3 70B), Pydantic v2, pdfplumber, React

**Python venv:** `backend\venv\Scripts\python.exe` (Pydantic 2.13.4 available)

---

### Task 1: Pydantic Schemas

**Files:**
- Create: `backend/schemas.py`

Define all Pydantic models for every stage's output and the final combined response. These act as contract enforcement and enable auto-retry on validation failure.

- [ ] **Step 1: Create `backend/schemas.py`** with the following models:

```python
from pydantic import BaseModel, Field
from typing import Optional


class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None


class ExperienceEntry(BaseModel):
    company: str
    title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    bullets: list[str] = []


class EducationEntry(BaseModel):
    institution: str
    degree: Optional[str] = None
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ProjectEntry(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: list[str] = []


class ResumeSections(BaseModel):
    contact: Optional[ContactInfo] = None
    summary: Optional[str] = None
    skills: list[str] = []
    experience: list[ExperienceEntry] = []
    education: list[EducationEntry] = []
    projects: list[ProjectEntry] = []
    certifications: list[str] = []


class RawObservations(BaseModel):
    total_sections_found: int = 0
    has_metrics: bool = False
    total_bullets: int = 0
    estimated_years_experience: Optional[float] = None


class Stage1Output(BaseModel):
    sections: ResumeSections
    raw_observations: RawObservations


class ScoreBreakdown(BaseModel):
    content_and_metrics: int = Field(ge=0, le=30, default=0)
    keyword_optimization: int = Field(ge=0, le=25, default=0)
    formatting_and_structure: int = Field(ge=0, le=15, default=0)
    experience_quality: int = Field(ge=0, le=20, default=0)
    education_and_skills: int = Field(ge=0, le=10, default=0)


class SectionFeedback(BaseModel):
    role: str
    feedback: str


class MissingKeywords(BaseModel):
    technical: list[str] = []
    soft_skills: list[str] = []
    domain_specific: list[str] = []


class Stage2Output(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    score_breakdown: ScoreBreakdown
    strengths: list[str]
    weaknesses: list[str]
    section_feedback: list[SectionFeedback] = []
    missing_keywords: MissingKeywords


class ImprovedBullet(BaseModel):
    original: str
    improved: str
    context: str


class Stage3Output(BaseModel):
    roast_level: str  # "light" | "medium" | "brutal"
    opening_roast: str
    improved_bullets: list[ImprovedBullet] = []
    final_verdict: str
    quick_wins: list[str] = []


class FinalResponse(BaseModel):
    """Combined output returned to the frontend (backward-compatible with existing schema)"""
    ats_score: int
    score_breakdown: ScoreBreakdown
    opening_roast: str
    summary: str  # synthesized from analysis
    strengths: list[str]
    weaknesses: list[str]
    missing_keywords: MissingKeywords  # frontend expects array; adapter needed
    improved_bullets: list[ImprovedBullet]
    section_feedback: list[SectionFeedback] = []
    quick_wins: list[str] = []
    final_verdict: str
    roast_level: str
```

- [ ] **Step 2: Verify the file imports correctly** — run Python import check
- [ ] **Step 3: Commit** `git add backend/schemas.py && git commit -m "feat: add pydantic schemas for pipeline stages"`

---

### Task 2: JSON Utility + Prompt Base

**Files:**
- Create: `backend/utils.py`
- Modify: `backend/main.py` (remove `extract_json` function)

Refactor the JSON extraction helper into a shared utility that all stages will use.

- [ ] **Step 1: Create `backend/utils.py`**:

```python
import json
import re
from typing import Any


def extract_json(text: str) -> dict[str, Any]:
    """Extract JSON object from LLM response, stripping markdown fences."""
    text = re.sub(r"```json|```", "", text).strip()
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end <= start:
        raise ValueError("No JSON object found in response")
    json_text = text[start:end]
    return json.loads(json_text)


def call_llm(client, model: str, messages: list, temperature: float = 0.3) -> str:
    """Synchronous LLM call wrapper."""
    completion = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )
    return completion.choices[0].message.content
```

- [ ] **Step 2: Update `backend/main.py`** — remove `extract_json` function, add `from utils import extract_json`
- [ ] **Step 3: Run test** — start backend, hit `/` endpoint to verify it still works
- [ ] **Step 4: Commit**

---

### Task 3: Stage 1 — Extract Prompt

**Files:**
- Create: `backend/prompts/extract_prompt.py`

Prompt designed to turn messy PDF text into clean structured JSON. Temperature 0.1 for determinism. Handles multi-column, garbled text, and missing sections gracefully.

- [ ] **Step 1: Create `backend/prompts/extract_prompt.py`**:

```python
SYSTEM_PROMPT = """You are a resume parsing AI. Your job is to extract structured information from raw resume text into valid JSON.

RULES:
- Extract ALL text — do not summarize or rewrite.
- Preserve exact wording of bullet points, skills, and descriptions.
- If text appears garbled or out of order (common with multi-column PDFs), use context clues to place content in the correct section.
- If a section is missing or empty, set it to null or an empty list — do not hallucinate.
- Output ONLY valid JSON. No markdown, no explanation.

EXPECTED OUTPUT STRUCTURE:
{
  "sections": {
    "contact": { "name": "...", "email": "...", "phone": "...", "linkedin": "..." },
    "summary": "text or null",
    "skills": ["skill1", "skill2"],
    "experience": [
      {
        "company": "Company Name",
        "title": "Job Title",
        "start_date": "Month YYYY",
        "end_date": "Month YYYY or Present",
        "bullets": ["bullet point text"]
      }
    ],
    "education": [
      {
        "institution": "School Name",
        "degree": "B.S.",
        "field": "Major",
        "start_date": "YYYY",
        "end_date": "YYYY"
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "description": "Short description",
        "technologies": ["tech1", "tech2"]
      }
    ],
    "certifications": ["Cert Name"]
  },
  "raw_observations": {
    "total_sections_found": 5,
    "has_metrics": false,
    "total_bullets": 12,
    "estimated_years_experience": 2.5
  }
}"""


def build_user_prompt(text: str) -> str:
    return f"""Extract and structure the following resume text into JSON.

Resume text:
{text}

Return ONLY valid JSON matching the specified structure."""
```

- [ ] **Step 2: Verify the file syntax** — run Python compile check
- [ ] **Step 3: Commit**

---

### Task 4: Stage 1 — Extractor Module

**Files:**
- Create: `backend/stages/__init__.py`
- Create: `backend/stages/extractor.py`

Implements Stage 1: calls LLM with extract prompt, validates output against `Stage1Output` schema, retries once on failure, returns structured data or None for fallback.

- [ ] **Step 1: Create `backend/stages/__init__.py`** (empty file)
- [ ] **Step 2: Create `backend/stages/extractor.py`**:

```python
from utils import extract_json, call_llm
from schemas import Stage1Output
from prompts.extract_prompt import SYSTEM_PROMPT, build_user_prompt
from openai import OpenAI


def run_stage1(client: OpenAI, raw_text: str, model: str = "llama-3.3-70b-versatile") -> Stage1Output | None:
    """Extract structured resume data from raw text. Returns None on failure."""
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(raw_text)},
        ]
        response = call_llm(client, model, messages, temperature=0.1)
        data = extract_json(response)
        return Stage1Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 1] Extraction failed: {e}")
        # Retry once
        try:
            response = call_llm(client, model, messages, temperature=0.1)
            data = extract_json(response)
            return Stage1Output.model_validate(data)
        except Exception as e2:
            print(f"[Stage 1] Retry also failed: {e2}")
            return None
```

- [ ] **Step 3: Verify import** — run `python -c "from stages.extractor import run_stage1; print('OK')"` from backend dir
- [ ] **Step 4: Commit**

---

### Task 5: Stage 2 — Analyze Prompt

**Files:**
- Create: `backend/prompts/analyze_prompt.py`

The core analytical prompt. Uses chain-of-thought: first review each section, then score against a weighted rubric, then synthesize findings. Forces specific citations from the resume.

- [ ] **Step 1: Create `backend/prompts/analyze_prompt.py`**:

```python
SYSTEM_PROMPT = """You are a senior technical recruiter and ATS expert. Given a structured resume, produce a deep analysis.

APPROACH:
1. First, review each section of the resume carefully.
2. For each section, note specific strong points and weak points — reference actual content.
3. Score against the weighted rubric below.
4. Identify missing keywords by category.
5. Synthesize into overall assessment.

SCORING RUBRIC (total 100):
- Content & Metrics (30 pts): Are achievements quantified? Are there concrete results? Vague descriptions lose points.
- Keyword Optimization (25 pts): Does it include relevant hard skills, soft skills, and domain terms? Generic resumes lose points.
- Formatting & Structure (15 pts): Is it well-organized? Consistent? Easy to scan? Clean sections?
- Experience Quality (20 pts): Does experience show progression? Relevance? Depth? Impact?
- Education & Skills (10 pts): Relevant degrees, certifications, skill breadth.

CRITICAL RULES:
- Every weakness MUST reference a specific resume element (e.g., "Under 'SWE Intern at Google', bullet 'Worked on performance' lacks metrics").
- Do NOT invent weaknesses that aren't present.
- Be brutally honest but constructive.
- Categorize missing keywords into technical, soft_skills, and domain_specific.
- Output ONLY valid JSON. No markdown."""


OUTPUT_FORMAT = """
{
  "ats_score": 72,
  "score_breakdown": {
    "content_and_metrics": 18,
    "keyword_optimization": 16,
    "formatting_and_structure": 12,
    "experience_quality": 14,
    "education_and_skills": 12
  },
  "strengths": [
    "specific strength referencing actual resume content"
  ],
  "weaknesses": [
    "specific weakness referencing actual resume content — be blunt"
  ],
  "section_feedback": [
    {
      "role": "Job Title at Company",
      "feedback": "Specific feedback about this role's bullet points"
    }
  ],
  "missing_keywords": {
    "technical": ["Kubernetes", "Docker"],
    "soft_skills": ["cross-functional leadership"],
    "domain_specific": []
  }
}"""


def build_user_prompt(structured_json: dict) -> str:
    import json
    return f"""Analyze this structured resume and provide a detailed assessment.

STRUCTURED RESUME:
{json.dumps(structured_json, indent=2)}

Return ONLY valid JSON matching this format:
{OUTPUT_FORMAT}"""
```

- [ ] **Step 2: Verify syntax**
- [ ] **Step 3: Commit**

---

### Task 6: Stage 2 — Analyzer Module

**Files:**
- Create: `backend/stages/analyzer.py`

Runs Stage 2 analysis. Takes structured resume (or raw text fallback), calls LLM, validates against `Stage2Output`, retries once.

- [ ] **Step 1: Create `backend/stages/analyzer.py`**:

```python
from utils import extract_json, call_llm
from schemas import Stage2Output
from prompts.analyze_prompt import SYSTEM_PROMPT, build_user_prompt
from openai import OpenAI


def run_stage2(client: OpenAI, resume_data: dict | str, model: str = "llama-3.3-70b-versatile") -> Stage2Output | None:
    """Analyze structured resume data. Accepts dict (from Stage 1) or raw text (fallback)."""
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(resume_data)},
        ]
        response = call_llm(client, model, messages, temperature=0.3)
        data = extract_json(response)
        return Stage2Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 2] Analysis failed: {e}")
        try:
            response = call_llm(client, model, messages, temperature=0.3)
            data = extract_json(response)
            return Stage2Output.model_validate(data)
        except Exception as e2:
            print(f"[Stage 2] Retry also failed: {e2}")
            return None
```

- [ ] **Step 2: Verify import**
- [ ] **Step 3: Commit**

---

### Task 7: Stage 3 — Roast Prompt

**Files:**
- Create: `backend/prompts/roast_prompt.py`

The personality layer. Takes structured resume + analysis results, generates entertaining but grounded roasts, bullet rewrites with context, quick wins.

- [ ] **Step 1: Create `backend/prompts/roast_prompt.py`**:

```python
SYSTEM_PROMPT = """You are RoastMyResume AI — a brutally honest recruiter friend with a sharp wit.

Your job: Turn the resume analysis into an entertaining, memorable roast that's STILL genuinely helpful.

RULES:
- Roast the RESUME, not the person. Never attack the user.
- Every roast must be grounded in a SPECIFIC weakness from the analysis.
- Bullet rewrites must include a "context" field explaining WHY the new version is better.
- Quick wins = 3 things fixable in 5 minutes.
- The "opening_roast" should be punchy and memorable (1-2 sentences).
- The "final_verdict" should summarize the gap between current and potential.
- Roast level: "light" (great resume, minor nitpicks), "medium" (solid but needs work), "brutal" (major overhaul needed).
- Be funny, not mean. Sarcasm yes, cruelty no.
- Output ONLY valid JSON."""


OUTPUT_FORMAT = """
{
  "roast_level": "medium",
  "opening_roast": "Funny 1-2 sentence roast referencing a specific weakness",
  "improved_bullets": [
    {
      "original": "Original weak bullet from the resume",
      "improved": "Rewritten strong bullet with metrics and impact",
      "context": "Why this rewrite is better (the insight)"
    }
  ],
  "final_verdict": "Memorable closing assessment",
  "quick_wins": ["Fix this in 5 minutes", "Fix this in 5 minutes", "Fix this in 5 minutes"]
}"""


def build_user_prompt(structured_resume: dict, analysis: dict) -> str:
    import json
    return f"""Generate a roast and improvements for this resume.

STRUCTURED RESUME:
{json.dumps(structured_resume, indent=2)}

ANALYSIS (use these specific weaknesses to ground your roasts):
{json.dumps(analysis, indent=2)}

Return ONLY valid JSON matching this format:
{OUTPUT_FORMAT}"""
```

- [ ] **Step 2: Verify syntax**
- [ ] **Step 3: Commit**

---

### Task 8: Stage 3 — Roaster Module

**Files:**
- Create: `backend/stages/roaster.py`

Runs Stage 3: generates roasts and improvements. Takes structured resume + analysis. Validates against `Stage3Output`. Higher temperature (0.6) for creative roasts.

- [ ] **Step 1: Create `backend/stages/roaster.py`**:

```python
from utils import extract_json, call_llm
from schemas import Stage3Output
from prompts.roast_prompt import SYSTEM_PROMPT, build_user_prompt
from openai import OpenAI


def run_stage3(client: OpenAI, structured_resume: dict, analysis: dict, model: str = "llama-3.3-70b-versatile") -> Stage3Output | None:
    """Generate roasts and improvements grounded in the analysis."""
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(structured_resume, analysis)},
        ]
        response = call_llm(client, model, messages, temperature=0.6)
        data = extract_json(response)
        return Stage3Output.model_validate(data)
    except Exception as e:
        print(f"[Stage 3] Roast generation failed: {e}")
        try:
            response = call_llm(client, model, messages, temperature=0.6)
            data = extract_json(response)
            return Stage3Output.model_validate(data)
        except Exception as e2:
            print(f"[Stage 3] Retry also failed: {e2}")
            return None
```

- [ ] **Step 2: Verify import**
- [ ] **Step 3: Commit**

---

### Task 9: Pipeline Orchestration (main.py rewrite)

**Files:**
- Modify: `backend/main.py`

Replace the single LLM call with the full 3-stage pipeline. Includes:
- PDF extraction (existing)
- Stage 1 with fallback
- Stage 2
- Stage 3
- Combine outputs into `FinalResponse`
- `summary` synthesized from Stage 2 strengths/weaknesses
- `missing_keywords` adapted to match frontend expectations
- Returns 207 Multi-Status if a stage fails (partial results) or 200 on full success

- [ ] **Step 1: Rewrite `backend/main.py`**:

```python
import io
import os

import pdfplumber
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

from utils import extract_json  # reuse existing
from schemas import FinalResponse, Stage1Output, Stage2Output, Stage3Output
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

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
)


def extract_text_from_pdf(content: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    if not text.strip():
        raise ValueError("Could not extract text from PDF")
    return text


@app.get("/")
def home():
    return {"message": "API Running"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        raw_text = extract_text_from_pdf(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Stage 1: Extract structured data
    structured: Stage1Output | None = run_stage1(client, raw_text)

    # Stage 2: Deep analysis (use structured data or raw text as fallback)
    analysis_input = structured.model_dump() if structured else raw_text
    analysis: Stage2Output | None = run_stage2(client, analysis_input)

    if analysis is None:
        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed. Please try again.",
        )

    # Stage 3: Roast & verdict (needs both structured resume + analysis)
    roast_input_structured = structured.model_dump() if structured else {"sections": {}, "raw_observations": {}}
    roast: Stage3Output | None = run_stage3(client, roast_input_structured, analysis.model_dump())

    # Synthesize summary from analysis
    summary_parts = []
    if analysis.strengths:
        summary_parts.append(f"Strengths: {analysis.strengths[0]}")
    if analysis.weaknesses:
        summary_parts.append(f"Areas to improve: {analysis.weaknesses[0]}")
    summary = " ".join(summary_parts) if summary_parts else "Analysis complete."

    # Build backward-compatible final response
    # Frontend expects missing_keywords as a flat list; we send categorized version
    # and let frontend adapt (or we flatten here — keep categorized, update frontend later)
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
```

- [ ] **Step 2: Start backend server** and verify `/` and `/analyze` endpoints work (test with a PDF)
- [ ] **Step 3: Commit**

---

### Task 10: Frontend — New Components for Enriched Data

**Files:**
- Create: `frontend/src/components/ScoreBreakdown.jsx`
- Create: `frontend/src/components/QuickWinsCard.jsx`
- Create: `frontend/src/components/SectionFeedback.jsx`

Add new display components for the enriched data fields.

- [ ] **Step 1: Create `ScoreBreakdown.jsx`** — horizontal bar chart showing the 5 rubric categories:

```jsx
const CATEGORIES = [
  { key: "content_and_metrics", label: "Content & Metrics", max: 30, color: "bg-accent-purple" },
  { key: "keyword_optimization", label: "Keyword Optimization", max: 25, color: "bg-accent-blue" },
  { key: "formatting_and_structure", label: "Formatting & Structure", max: 15, color: "bg-accent-cyan" },
  { key: "experience_quality", label: "Experience Quality", max: 20, color: "bg-accent-amber" },
  { key: "education_and_skills", label: "Education & Skills", max: 10, color: "bg-accent-green" },
];

const ScoreBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
        Score Breakdown
      </h3>
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const score = breakdown[cat.key] ?? 0;
          const pct = (score / cat.max) * 100;
          return (
            <div key={cat.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">{cat.label}</span>
                <span className="text-text-primary font-mono font-medium">{score}/{cat.max}</span>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cat.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
```

- [ ] **Step 2: Create `QuickWinsCard.jsx`**:

```jsx
const QuickWinsCard = ({ quickWins }) => {
  if (!quickWins || quickWins.length === 0) return null;
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border-accent-green/20">
      <div className="flex items-center gap-2.5 mb-4">
        <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">Quick Wins</h3>
      </div>
      <ul className="space-y-2">
        {quickWins.map((win, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            {win}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickWinsCard;
```

- [ ] **Step 3: Create `SectionFeedback.jsx`**:

```jsx
const SectionFeedback = ({ sectionFeedback }) => {
  if (!sectionFeedback || sectionFeedback.length === 0) return null;
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Section-by-Section Feedback</h3>
      <div className="space-y-4">
        {sectionFeedback.map((sf, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-elevated border border-border-subtle">
            <p className="text-sm font-semibold text-text-primary mb-1">{sf.role}</p>
            <p className="text-sm text-text-secondary">{sf.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionFeedback;
```

- [ ] **Step 4: Verify components render correctly** — do a quick `npm run build` check
- [ ] **Step 5: Commit**

---

### Task 11: Frontend — Update ResultsSection

**Files:**
- Modify: `frontend/src/components/ResultsSection.jsx`

Wire new components into the results layout: ScoreBreakdown, SectionFeedback, QuickWinsCard. Handle the new `missing_keywords` structure (object instead of flat array).

- [ ] **Step 1: Edit `ResultsSection.jsx`** — import and place new components:

```jsx
import AtsScoreCard from "./AtsScoreCard";
import ScoreBreakdown from "./ScoreBreakdown";
import SectionFeedback from "./SectionFeedback";
import QuickWinsCard from "./QuickWinsCard";
import { RoastCard, StrengthCard, WeaknessCard, KeywordsCard, ImprovedBulletsCard, VerdictCard } from "./ResultCard";

const ResultsSection = ({ data }) => {
  if (!data) return null;

  // Adapt missing_keywords: if it's an object (new format), flatten for KeywordsCard
  const keywordList = data.missing_keywords
    ? typeof data.missing_keywords === "object" && !Array.isArray(data.missing_keywords)
      ? [
          ...(data.missing_keywords.technical || []),
          ...(data.missing_keywords.soft_skills || []),
          ...(data.missing_keywords.domain_specific || []),
        ]
      : data.missing_keywords
    : [];

  return (
    <section id="results" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 animated-gradient-bg opacity-30" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
            Your Resume Analysis
          </h2>
          <p className="text-text-secondary">
            Here&apos;s what the AI recruiters think — the good, the bad, and the roastable.
          </p>
        </div>

        <div className="space-y-6 stagger-fade-in">
          {/* Top Row: ATS Score + Roast */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AtsScoreCard score={data.ats_score} />
            </div>
            <div className="lg:col-span-2">
              <RoastCard openingRoast={data.opening_roast} />
            </div>
          </div>

          {/* Score Breakdown — new */}
          <ScoreBreakdown breakdown={data.score_breakdown} />

          {/* Summary */}
          {data.summary && (
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">Summary</h3>
              <p className="text-text-secondary leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StrengthCard strengths={data.strengths} />
            <WeaknessCard weaknesses={data.weaknesses} />
          </div>

          {/* Section Feedback — new */}
          <SectionFeedback sectionFeedback={data.section_feedback} />

          {/* Missing Keywords */}
          <KeywordsCard keywords={keywordList} />

          {/* Improved Bullets */}
          <ImprovedBulletsCard bullets={data.improved_bullets} />

          {/* Quick Wins — new */}
          <QuickWinsCard quickWins={data.quick_wins} />

          {/* Final Verdict */}
          <VerdictCard verdict={data.final_verdict} roastLevel={data.roast_level} />
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
```

- [ ] **Step 2: Verify frontend builds** — `npm run build` (no TypeScript errors)
- [ ] **Step 3: Commit**

---

### Task 12: Frontend — Progressive Stage Loading

**Files:**
- Modify: `frontend/src/components/UploadSection.jsx`

Replace the single progress bar with visual stage indicators showing "Parsing... → Analyzing... → Roasting..." as each stage completes.

Note: Since the backend is a single endpoint, the frontend doesn't actually know when each stage completes. We'll simulate it with timed transitions after receiving the response, OR we can split into 3 backend endpoints — but that's a bigger change. For now, we'll show an animated sequence of stages that advance based on estimated timing, then snap to done when response arrives.

- [ ] **Step 1: Edit `UploadSection.jsx`** — add stage indicators in the loading state:

In the loading section (around line 131-155), replace the simple progress display with:

```jsx
const STAGES = [
  { id: "extract", label: "Parsing resume structure..." },
  { id: "analyze", label: "Analyzing content & scoring..." },
  { id: "roast", label: "Crafting your roast..." },
];
```

And in the loading JSX:

```jsx
{loading && (
  <div className="space-y-6">
    {/* Animated icon */}
    <div className="relative w-16 h-16 mx-auto">
      <svg className="w-16 h-16 animate-spin-slow" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" className="text-border-subtle" />
        <circle cx="32" cy="32" r="28" stroke="url(#gradient)" strokeWidth="3" strokeDasharray="176" strokeDashoffset={176 - (uploadProgress / 100) * 176} className="ats-ring-fill" />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    {/* Stage indicators */}
    <div className="max-w-sm mx-auto space-y-3">
      {STAGES.map((stage, i) => {
        const stageProgress = uploadProgress / 100;
        const stageStart = i / STAGES.length;
        const stageEnd = (i + 1) / STAGES.length;
        const isActive = stageProgress >= stageStart && stageProgress < stageEnd;
        const isComplete = stageProgress >= stageEnd;
        return (
          <div key={stage.id} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              isComplete
                ? "bg-accent-green/20 text-accent-green"
                : isActive
                ? "bg-accent-purple/20 text-accent-purple"
                : "bg-surface-elevated text-text-muted"
            }`}>
              {isComplete ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            <span className={`text-sm transition-colors duration-300 ${
              isComplete ? "text-text-primary" : isActive ? "text-text-primary font-medium" : "text-text-muted"
            }`}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>

    {/* Progress bar */}
    <div className="max-w-xs mx-auto bg-surface-elevated rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full glow-gradient transition-all duration-300 ease-out"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
  </div>
)}
```

Also add the `STAGES` constant outside the component (or as a module-level const).

- [ ] **Step 2: Verify frontend builds**
- [ ] **Step 3: Commit**

---

### Task 13: End-to-End Validation

- [ ] **Step 1: Start backend**: `uvicorn main:app --reload` from `backend/` dir
- [ ] **Step 2: Start frontend**: `npm run dev` from `frontend/` dir
- [ ] **Step 3: Upload a test PDF resume** and verify:
  - [ ] Stage indicators show progressive loading
  - [ ] Results display with all new sections (Score Breakdown, Section Feedback, Quick Wins)
  - [ ] Roasts reference specific resume content (not generic)
  - [ ] ATS score has corresponding breakdown
  - [ ] Bullet rewrites include context field
- [ ] **Step 4: Test error scenarios**:
  - [ ] Upload a non-PDF file → error message
  - [ ] Upload an empty file → error message
  - [ ] Check that fallback works (if Stage 1 fails, analysis still runs)
- [ ] **Step 5: Commit** any fixes

---

## Rollback Plan

If the pipeline introduces regressions, revert to the previous single-call approach:

```
git revert HEAD --no-commit  # revert all staged changes
# Keep only main.py change that reverts to single call
git checkout HEAD -- backend/main.py  # restore original main.py
```

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Stage 1 fails to parse messy PDFs | Medium | Medium | Fallback to raw text for Stage 2 |
| 3 sequential calls too slow (>20s) | Medium | High | Add frontend stage indicators to mask; optimize later with streaming |
| ATS score breakdown confuses users | Low | Low | It adds transparency; users can see why score is what it is |
| Roasts feel disconnected after pipeline | Low | Medium | Stage 3 explicitly receives Stage 2 weaknesses as input |
| Pydantic validation too strict | Medium | Low | Retry logic with original error as hint to model |
