from pydantic import BaseModel, Field
from typing import Optional


# stage 1 models

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None


class ExperienceEntry(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    bullets: list[str] = []


class EducationEntry(BaseModel):
    institution: Optional[str] = None
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


# stage 2 models

class ScoreBreakdown(BaseModel):
    """5 categories adding up to 100"""
    content_and_metrics: int = Field(default=0, ge=0, le=30)
    keyword_optimization: int = Field(default=0, ge=0, le=25)
    formatting_and_structure: int = Field(default=0, ge=0, le=15)
    experience_quality: int = Field(default=0, ge=0, le=20)
    education_and_skills: int = Field(default=0, ge=0, le=10)


class SectionFeedback(BaseModel):
    role: str
    feedback: str


class MissingKeywords(BaseModel):
    technical: list[str] = []
    soft_skills: list[str] = []
    domain_specific: list[str] = []


class Stage2Output(BaseModel):
    ats_score: int = Field(default=0, ge=0)
    score_breakdown: ScoreBreakdown = ScoreBreakdown()
    strengths: list[str] = []
    weaknesses: list[str] = []
    section_feedback: list[SectionFeedback] = []
    missing_keywords: MissingKeywords = MissingKeywords()


# stage 3 models

class ImprovedBullet(BaseModel):
    original: str
    improved: str
    context: str


class Stage3Output(BaseModel):
    roast_level: str = "medium"
    opening_roast: str = ""
    improved_bullets: list[ImprovedBullet] = []
    final_verdict: str = ""
    quick_wins: list[str] = []


# final combined response sent to frontend

class FinalResponse(BaseModel):
    ats_score: int = 0
    score_breakdown: ScoreBreakdown = ScoreBreakdown()
    opening_roast: str = ""
    summary: str = ""
    strengths: list[str] = []
    weaknesses: list[str] = []
    missing_keywords: MissingKeywords = MissingKeywords()
    improved_bullets: list[ImprovedBullet] = []
    section_feedback: list[SectionFeedback] = []
    quick_wins: list[str] = []
    final_verdict: str = ""
    roast_level: str = "medium"
