export type BriefSection = {
  heading: string
  body: string
}

export type InvestmentBrief = {
  building_id: string
  generated_at: string
  executive_summary: string
  opportunity_overview: string
  financial_case: BriefSection
  risk_and_mitigation: BriefSection
  regulatory_context: BriefSection
  esg_narrative: BriefSection
  recommended_next_steps: string[]
  confidence_note: string
}
