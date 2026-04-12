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
        key = os.environ.get("GOOGLE_API_KEY")
        if not key:
            raise RuntimeError("GOOGLE_API_KEY not set — add it to backend/.env")
        _client = genai.Client(api_key=key)
    return _client


def build_prompt(building: BuildingRecord, roi: ROIResponse, context: str) -> str:
    return f"""You are a Grundfos water solutions specialist writing a structured investment brief
for a commercial building rainwater harvesting opportunity. Fill every field with specific,
numbers-driven content. Do not use generic language.

## Building Record
{building.model_dump_json(indent=2)}

## ROI Analysis ({roi.scenario} scenario)
- Harvestable gallons/year:       {roi.harvestable_gal:,} gal
- Annual water savings:           ${roi.annual_water_savings_usd:,.0f}
- Annual sewer savings:           ${roi.annual_sewer_savings_usd:,.0f}
- Stormwater fee avoidance:       ${roi.stormwater_fee_avoidance_usd:,.0f}
- Total annual savings:           ${roi.total_annual_savings_usd:,.0f}
- System capex (mid):             ${roi.capex_mid_usd:,.0f}
- Simple payback:                 {roi.simple_payback_yrs} years
- 10-year NPV:                    ${roi.npv_10yr_usd:,.0f}
- Base ROI:                       {roi.base_roi_pct}%
- Confidence-adjusted ROI:        {roi.confidence_adj_roi_pct}% (base × {roi.cv_confidence_pct}% CV confidence)
- CO₂ offset:                     {roi.co2_offset_lbs:,} lbs/year

## Reference Context (grounded sources)
{context}

## Instructions

**why_this_building_now** — Write 2–3 sentences combining urgency drivers, financial signals,
and ESG context using actual numbers from the building record and ROI analysis above.
Follow this pattern strictly:
"[Cost signal with $ or % figure] + [Physical signal with CV confidence] + [Corporate pressure] → [Urgency conclusion]"
Example shape: "Water costs up 18% YoY in Bexar County combined with 3 detected cooling towers
(81% CV confidence) and Amazon's SBTi Net Zero 2040 commitment create a high-urgency, high-ROI
prospect: $67,282 in annual savings at a 3.3-year payback."

**confidence_caveats** — Be honest:
- cv_confidence_pct reflects satellite detection certainty for physical signals (cooling towers,
  roof geometry). A score of {roi.cv_confidence_pct}% means projections carry meaningful
  uncertainty until a site visit confirms the physical assumptions.
- key_assumptions should list the 2–3 most load-bearing assumptions in the ROI model
  (rainfall average, collection efficiency, utility rate stability).
- next_validation_step must be the single highest-value action to reduce uncertainty
  (e.g., on-site roof inspection, utility rate verification, cooling tower capacity audit).

Return a complete, sales-ready brief. Every field must be populated with real numbers.
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
