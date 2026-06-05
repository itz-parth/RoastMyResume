from schemas import FinalResponse
from stages.extractor import run_stage1
from stages.analyzer import run_stage2
from stages.roaster import run_stage3

STRUCTURED_RESUME_DEFAULT = {
    "sections": {},
    "raw_observations": {}
}

def process_resume(client, raw_text: str, job_description: str = None):
    structured = run_stage1(client, raw_text)
    structured_data = structured.model_dump() if structured else None

    analysis = run_stage2(client, structured_data, job_description)
    if analysis is None:
        raise Exception("Resume analysis failed")

    roast = run_stage3(client, structured_data or STRUCTURED_RESUME_DEFAULT, analysis.model_dump())

    return build_final_response(analysis, roast)


def build_final_response(analysis, roast):

    summary_parts = []
    if analysis.strengths:
        summary_parts.append(f"Strengths: {analysis.strengths[0]}")
    if analysis.weaknesses:
        summary_parts.append(f"Area to improve: {analysis.weaknesses[0]}")
    summary = " ".join(summary_parts) if summary_parts else "Analysis complete."

    return FinalResponse(
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
