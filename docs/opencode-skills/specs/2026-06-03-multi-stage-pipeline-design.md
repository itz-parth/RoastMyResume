# Multi-Stage Resume Analysis Pipeline — Design Document

## Problem
Current single-pass approach produces shallow, generic results across all dimensions:
- Roasts lack specificity
- ATS score feels arbitrary
- Suggestions are generic
- Parsing errors and inconsistent tone

## Goal
Deliver ChatGPT-level resume insight with specific, actionable feedback grounded in the actual resume content — while preserving the entertaining "roast" personality.

## Architecture

```
Raw PDF Text ──▶ Stage 1: Structuring ──▶ Structured Resume JSON
                                               │
                                               ▼
                              Stage 2: Deep Analysis ──▶ Analysis JSON
                                               │
                                               ▼
                              Stage 3: Roast + Verdict ──▶ Final Output JSON
                                               │
                                               ▼
                                        Frontend Display
```

### Stage 1: Resume Structurer
- **Model**: `llama-3.3-70b-versatile`, temperature 0.1
- **Input**: Raw text from pdfplumber
- **Output**: Structured resume JSON with sections (contact, summary, skills, experience, education, projects, certifications)
- **Edge cases**: Multi-column PDFs, missing sections, garbled text, scanned PDFs

### Stage 2: Deep Analyzer
- **Model**: `llama-3.3-70b-versatile`, temperature 0.3
- **Input**: Structured resume JSON from Stage 1
- **Output**: ATS score with weighted rubric breakdown, strengths, weaknesses (with specific citations), section-level feedback, categorized missing keywords
- **Rubric**: Content & Metrics (30%), Keyword Optimization (25%), Formatting & Structure (15%), Experience Quality (20%), Education & Skills (10%)

### Stage 3: Roast & Verdict Generator
- **Model**: `llama-3.3-70b-versatile`, temperature 0.6
- **Input**: Structured resume + Analysis results
- **Output**: Opening roast, improved bullets (with context explaining the improvement), final verdict, quick wins
- **Key**: Roasts are grounded in specific weaknesses found in Stage 2

## Risk Mitigation
- Pydantic validation at each stage with auto-retry on malformed JSON
- Fallback to raw text if Stage 1 fails
- Progressive loading on frontend to mask latency
- Session caching of Stage 1 output

## Files to Create/Modify

### Backend
- `backend/schemas.py` — Pydantic models
- `backend/stages/extractor.py` — Stage 1
- `backend/stages/analyzer.py` — Stage 2
- `backend/stages/roaster.py` — Stage 3
- `backend/prompts/` — Separate prompt files for each stage
- `backend/main.py` — Pipeline orchestration with retry/fallback

### Frontend
- `UploadSection.jsx` — Progressive stage indicators
- `ResultsSection.jsx` — Handle new fields
- `ResultCard.jsx` or new components — Score breakdown, quick wins, section feedback
- `AtsScoreCard.jsx` — Breakdown bars
