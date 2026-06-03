# RoastMyResume

Upload your resume PDF and get roasted by AI recruiters. It gives you an ATS score, points out what is wrong, rewrites weak bullet points, and tells you what keywords are missing. All in a dark themed UI.

---

## How It Works (Big Picture)

```
You upload a PDF
      |
      v
[Backend] extracts text from the PDF
      |
      v
[Stage 1] LLM turns raw text into structured JSON (name, jobs, skills, etc)
      |
      v
[Stage 2] LLM scores the resume and lists strengths / weaknesses
      |
      v
[Stage 3] LLM writes a funny roast + improved bullet points + quick wins
      |
      v
[Frontend] shows everything in cards with animations
```

The frontend is React + Tailwind CSS v4. The backend is Python FastAPI. The AI runs on Groq (using Llama 3.3 70B).

---

## Project Structure

```
RoastMyResume/
├── backend/                    # Python FastAPI server
│   ├── main.py                 # Entry point, defines the API routes
│   ├── schemas.py              # Pydantic models for every data shape
│   ├── utils.py                # Helper functions (call LLM, parse JSON)
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # API keys (GROQ_API_KEY)
│   ├── stages/                 # The 3 pipeline stages
│   │   ├── extractor.py        # Stage 1: raw text -> structured data
│   │   ├── analyzer.py         # Stage 2: structured data -> scores
│   │   └── roaster.py          # Stage 3: analysis -> roast + rewrites
│   └── prompts/                # LLM system prompts for each stage
│       ├── extract_prompt.py
│       ├── analyze_prompt.py
│       └── roast_prompt.py
│
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Root component, manages state
│   │   ├── App.css             # All styles (Tailwind + custom CSS)
│   │   └── components/         # All UI pieces
│   │       ├── Navbar.jsx
│   │       ├── HeroSection.jsx
│   │       ├── UploadSection.jsx
│   │       ├── ResultsSection.jsx
│   │       ├── AtsScoreCard.jsx
│   │       ├── ScoreBreakdown.jsx
│   │       ├── SectionFeedback.jsx
│   │       ├── QuickWinsCard.jsx
│   │       ├── ResultCard.jsx
│   │       └── Uploader.jsx    # OLD unused component, ignore
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md                   # This file
```

---

## Backend Explained

### main.py (the server)

This is a FastAPI server with two routes:

- **GET /** — just returns `{"message": "API Running"}` to check the server is alive.
- **POST /analyze** — accepts a PDF file, runs all 3 stages, returns the result.

When you upload a PDF, here is the exact flow inside `main.py`:

1. Check the file is actually a PDF and is not empty.
2. Use `pdfplumber` to extract text from the PDF. If no text comes out, it errors (scanned PDFs wont work).
3. **Stage 1** — pass the raw text to `run_stage1()`. This sends the text to the LLM and asks it to return structured JSON (name, email, job history, skills, etc). If it fails, we get `None` and fall back to raw text later.
4. **Stage 2** — pass the structured data (or raw text if stage 1 failed) to `run_stage2()`. The LLM returns an ATS score, a score breakdown (5 categories), strengths, weaknesses, missing keywords, and section feedback.
5. **Stage 3** — pass the structured resume + analysis to `run_stage3()`. The LLM returns an opening roast, improved bullet points, quick wins, and a final verdict.
6. Combine everything into a `FinalResponse` object and send it back to the frontend as JSON.

### schemas.py (data shapes)

Every piece of data has a Pydantic model (which is like a blueprint that validates the data). They are split by stage:

**Stage 1 models:**
- `ContactInfo` — name, email, phone, linkedin (all optional, LLM sometimes misses them)
- `ExperienceEntry` — company, title, dates, bullet points. Company and title are optional because the LLM sometimes returns null.
- `EducationEntry` — school, degree, field, dates
- `ProjectEntry` — name, description, technologies
- `ResumeSections` — groups everything above into one object
- `RawObservations` — counts like total sections found, whether metrics exist
- `Stage1Output` — combines sections + raw observations

**Stage 2 models:**
- `ScoreBreakdown` — 5 categories that add up to roughly 100. Each field has `ge=0` (no negatives) but no upper limit because the LLM sometimes overshoots.
- `SectionFeedback` — feedback for a specific job role on the resume
- `MissingKeywords` — technical, soft_skills, domain_specific (3 lists)
- `Stage2Output` — ats_score + breakdown + strengths + weaknesses + feedback + keywords

**Stage 3 models:**
- `ImprovedBullet` — original bullet, improved version, and why it is better
- `Stage3Output` — roast_level, opening_roast, improved_bullets, final_verdict, quick_wins

**Final:**
- `FinalResponse` — merges everything from all 3 stages into one payload for the frontend

### utils.py (helpers)

Two small helper functions used by all stages:

- `extract_json(text)` — takes an LLM response (which often has markdown like ```json ... ```) and pulls out the JSON object. Throws an error if no JSON is found.
- `call_llm(client, model, messages, temperature)` — sends a chat completion request to the LLM and returns the text response.

### stages/ (the 3 pipeline stages)

Each stage follows the same pattern:
1. Build a list of messages: system prompt + user prompt.
2. Call the LLM.
3. Try to parse the response as the expected Pydantic model.
4. If it fails, retry once.
5. If both fail, return `None` (the server handles the fallback).

**extractor.py** (Stage 1) — temperature 0.1 (low creativity, just extract accurately). Takes raw text, returns `Stage1Output` or None.

**analyzer.py** (Stage 2) — temperature 0.3. Takes structured data (dict) or raw text (str) as fallback, returns `Stage2Output` or None.

**roaster.py** (Stage 3) — temperature 0.6 (higher creativity for funny roasts). Takes structured resume + analysis, returns `Stage3Output` or None.

### prompts/ (LLM instructions)

Each prompt file has a `SYSTEM_PROMPT` (constant string that sets the role and rules) and a `build_user_prompt()` function that inserts the actual data.

- **extract_prompt.py** — tells the LLM to be a resume parser. Rules: do not summarize, preserve exact wording, do not hallucinate missing data.
- **analyze_prompt.py** — tells the LLM to be a senior technical recruiter. Gives a scoring rubric (5 categories worth 100 total). Requires every weakness to reference a specific resume element.
- **roast_prompt.py** — tells the LLM to be a brutally honest recruiter friend. Rules: roast the resume not the person, reference specific weaknesses, be funny but not mean.

---

## Frontend Explained

### main.jsx

The entry point. React 19 creates a root element and renders the `<App />` component inside `<StrictMode>`.

### App.jsx (root component)

Manages 3 pieces of state:
- `response` — the data from the backend (null initially, gets set when analysis completes)
- `error` — error message to show (null initially)
- `uploadRef` — a ref to the upload section, used for smooth scrolling

When the user clicks the CTA button in the hero, it scrolls to the upload section. When a file is analyzed, it scrolls to the results section after a 100ms delay.

If there is an error, it shows a red card with the error message and a close button. Once `response` is available, it shows `ResultsSection`.

### App.css (all styles)

Uses Tailwind CSS v4 with the `@theme` directive to define custom design tokens:

- **Colors** — brand purples, surface colors (dark mode), text hierarchy, accent colors, score colors
- **Shadows** — glow effects for the purple theme, card shadows
- **Animations** — glow-pulse, float, fade-in, slide-up, scale-in, shimmer
- **Custom classes** — `.glass-card` (blurred background card), `.glow-gradient` (purple gradient), `.animated-gradient-bg` (subtle background lights), `.btn-glow` (button with hover glow effect)
- **Stagger animation** — `.stagger-fade-in` makes children appear one after another with increasing delays (7 items max)

### Components

**Navbar.jsx**
A fixed top nav with the logo and an "AI Powered" badge. Has a glass-morphism background (blur + semi-transparent).

**HeroSection.jsx**
The landing section. Full screen with animated gradient blobs in the background and a subtle grid overlay. Has the main heading ("Your Resume Deserves Better"), a description paragraph, two buttons (CTA to upload + Learn More), and a mock analysis preview card.

**UploadSection.jsx**
The file upload area. Supports drag-and-drop and file picker. When a PDF is dropped or selected, it immediately starts the analysis.

During loading it shows:
- A spinning SVG ring with a gradient
- 3 stage indicators (Parsing, Analyzing, Crafting) that light up sequentially as progress increases
- A progress bar

The progress is simulated (not real) — it jumps up randomly every 300ms until the API responds, then snaps to 100%.

After the upload, it shows trust indicators (No data stored, AI-powered, Takes ~10 seconds).

**ResultsSection.jsx**
The results page. Takes the `data` prop from App and lays out all the result cards in a vertical stack with staggered animations.

It also converts `missing_keywords` from the backend format (object with `technical`, `soft_skills`, `domain_specific` arrays) into a flat array for the KeywordsCard component.

**AtsScoreCard.jsx**
Shows the ATS score as a circular progress ring (SVG). The ring color changes based on score:
- 90+: green (Exceptional)
- 75-89: blue (Strong)
- 60-74: amber (Average)
- Below 60: red (Needs Work)

Below the circle there is a 4-segment bar showing the score range indicators.

**ScoreBreakdown.jsx**
Shows 5 horizontal progress bars for the score categories:
- Content & Metrics (max 30)
- Keyword Optimization (max 25)
- Formatting & Structure (max 15)
- Experience Quality (max 20)
- Education & Skills (max 10)

Each bar shows the score out of its max and fills to the correct percentage.

**ResultCard.jsx**
A reusable card wrapper used by multiple result sections. Has variants:
- `default` — standard glass card
- `roast` — glass card with purple border
- `verdict` — glass card with cyan border

Also exports named components:
- `StrengthCard` — green checkmarks
- `WeaknessCard` — red X marks
- `KeywordsCard` — shows missing keywords as purple pills/tags
- `ImprovedBulletsCard` — shows before (strikethrough red) and after (green) side by side
- `RoastCard` — italic quote with purple border
- `VerdictCard` — bold verdict text with roast level badge

**SectionFeedback.jsx**
Shows feedback for each role/section on the resume. Each entry has a role title and feedback text in a card.

**QuickWinsCard.jsx**
Shows 3 quick fixes the user can do in 5 minutes, each with a green checkmark.

---

## Setup & Running

### Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv
.\venv\Scripts\activate    # Windows
source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Groq API key
# GROQ_API_KEY=your_key_here

# Run the server
uvicorn main:app --reload
```

The backend runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend runs on `http://localhost:5173` (or whatever Vite picks).

### Environment Variables

Only one is needed:

```
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Get one at https://console.groq.com

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/analyze` | Upload PDF, returns full analysis |

### POST /analyze

Accepts `multipart/form-data` with a single field `file` containing the PDF.

Returns JSON with this structure:
```json
{
  "ats_score": 72,
  "score_breakdown": {
    "content_and_metrics": 18,
    "keyword_optimization": 16,
    "formatting_and_structure": 12,
    "experience_quality": 14,
    "education_and_skills": 12
  },
  "opening_roast": "Your resume is like a plain bagel...",
  "summary": "Strengths: ... Area to improve: ...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missing_keywords": {
    "technical": ["Kubernetes"],
    "soft_skills": ["leadership"],
    "domain_specific": []
  },
  "improved_bullets": [
    {"original": "...", "improved": "...", "context": "..."}
  ],
  "section_feedback": [
    {"role": "Software Engineer at Google", "feedback": "..."}
  ],
  "quick_wins": ["Add a summary section", "..."],
  "final_verdict": "Solid resume but needs more metrics.",
  "roast_level": "medium"
}
```

---

## Known Issues / Notes

- **Scanned PDFs wont work** — `pdfplumber` can only extract text from text-based PDFs. Scanned documents (images) will fail.
- **LLM can be unpredictable** — sometimes it returns invalid JSON or wrong values. Each stage retries once, and the Pydantic models are lenient (optional fields, no upper bounds on scores).
- **`Uploader.jsx`** — this is an old component that is not used anymore. It has a bug where it treats `missing_keywords` as an array instead of an object. It is safe to delete.
- **Progress bar is fake** — the loading animation in the upload section is simulated, not tied to actual stage progress.
