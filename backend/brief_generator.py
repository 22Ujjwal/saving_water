# brief_generator.py
import os
import logging

from dotenv import load_dotenv
from pydantic import ValidationError
from google import genai
from google.genai import types

from models import BuildingRecord, BriefResponse, ROIResponse
from rag_retrieval import retrieve_context

load_dotenv()
logger = logging.getLogger(__name__)
MODEL = "gemini-2.5-flash"
_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY not set — add it to backend/.env")
        _client = genai.Client(api_key=api_key)
    return _client


def build_prompt(building: BuildingRecord, roi: ROIResponse, context: str) -> str:
    return f"""You are a Grundfos water solutions specialist writing a structured investment brief
for a commercial building rainwater harvesting opportunity. Use specific numbers from the data.

## Building
{building.model_dump_json(indent=2)}

## ROI (base scenario)
- Harvestable: {roi.harvestable_gal:,} gal/yr
- Water savings: ${roi.annual_water_savings_usd:,.0f}/yr
- Sewer savings: ${roi.annual_sewer_savings_usd:,.0f}/yr
- Total savings: ${roi.total_annual_savings_usd:,.0f}/yr
- Capex (mid): ${roi.capex_mid_usd:,.0f}
- Payback: {roi.simple_payback_yrs} yrs
- 10-yr NPV: ${roi.npv_10yr_usd:,.0f}
- Base ROI: {roi.base_roi_pct}%
- Confidence-adj ROI: {roi.confidence_adj_roi_pct}%
- CV confidence: {roi.cv_confidence_pct}%

## Reference Context
{context}

## Output Schema
Return JSON with exactly these fields:
- building_id: the building ID string
- title: short compelling title for this opportunity (one sentence)
- executive_summary: 2-3 sentences with real numbers on why this building is a strong prospect
- key_metrics: object with roi (e.g. "42.3%"), payback (e.g. "4.1 yrs"), water_savings (e.g. "$28,400/yr") as strings
- recommended_angle: one of "cost_savings" | "resilience" | "compliance" | "esg_credibility"
- pitch_script: 3-4 sentence sales pitch with specific dollar figures
- risks_and_mitigation: array of 2-3 strings, each a "Risk: ... / Mitigation: ..." pair
"""


def generate_brief(building: BuildingRecord, roi: ROIResponse) -> BriefResponse:
    context = retrieve_context(building)
    prompt = build_prompt(building, roi, context)

    response = _get_client().models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=BriefResponse,
        ),
    )

    try:
        return BriefResponse.model_validate_json(response.text)
    except ValidationError as e:
        logger.error("BriefResponse validation failed. Raw response:\n%s", response.text)
        raise
