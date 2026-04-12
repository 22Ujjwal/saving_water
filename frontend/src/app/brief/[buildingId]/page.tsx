import React from "react";
import BriefHeader from "@/components/brief/BriefHeader";
import SatellitePanel from "@/components/brief/SatellitePanel";
import BriefReport, { BriefReportData } from "@/components/brief/BriefReport";

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with fetchBuilding(buildingId) + generateBrief(buildingId) once
// backend is wired. All values match the stub building in data/buildings.json.

const MOCK_BUILDINGS: Record<string, {
  address: string;
  metro: string;
  state: string;
  buildingType: string;
  ownerTenant?: string;
  lat: number;
  lng: number;
  roofAreaSqft: number;
  coolingTowerCount: number;
  cvConfidencePct: number;
  urgencyScore: number;
  viabilityScore: number;
  recommendedAngle: "cost_savings" | "resilience" | "compliance" | "esg_credibility";
  imageryDate?: string;
  imagerySource?: string;
  imageryUrl?: string;
}> = {
  "bld_stub_001": {
    address: "4500 N Loop 1604 W, San Antonio, TX 78249",
    metro: "San Antonio",
    state: "TX",
    buildingType: "distribution_center",
    ownerTenant: "Amazon",
    lat: 29.5988,
    lng: -98.6265,
    roofAreaSqft: 420_000,
    coolingTowerCount: 3,
    cvConfidencePct: 81,
    urgencyScore: 9,
    viabilityScore: 88,
    recommendedAngle: "cost_savings",
    imageryDate: "Feb 2024",
    imagerySource: "Sentinel-2 / Maxar",
  },
};

const MOCK_BRIEF: BriefReportData = {
  generatedAt: "April 11, 2026",
  buildingRef: "GRF-2026-TX-001",
  analyst: "RainUSE Nexus AI Engine",

  executiveSummary:
    "The Amazon distribution center at 4500 N Loop 1604 W, San Antonio represents a high-confidence, high-urgency candidate for Grundfos rainwater reuse system deployment. With 420,000 sqft of harvestable roof surface, three active cooling towers, and Bexar County water costs escalating 18% year-over-year, the financial case is unusually strong. A base-case system delivers $68,400 in annual combined savings against a net CapEx of approximately $195,000 after incentives — yielding a simple payback of 2.9 years and a 10-year NPV exceeding $330,000. Amazon's public SBTi commitment and Net Zero 2040 pledge create procurement-level motivation beyond pure cost reduction. The CV confidence-adjusted ROI of 86.3% reflects satellite-derived uncertainty at 81% detection confidence; a single physical site survey is the most impactful next step to sharpen this number.",

  opportunityOverview: {
    headline:
      "A water-stressed mega-distribution center where financial urgency, physical suitability, and ESG obligation converge.",
    bullets: [
      "Bexar County water rates have risen 18% year-over-year — significantly above the national CPI, creating an immediate cost-reduction mandate for facility managers.",
      "Three cooling towers detected at 81% CV confidence represent the dominant water consumption vector; rainwater blowdown substitution is the highest-leverage intervention.",
      "The 420,000 sqft roof footprint yields approximately 7.94 million harvestable gallons per year under base-case assumptions — enough to offset a meaningful share of process water demand.",
      "Active stormwater fee of $18,400/yr provides a direct avoidance line item that compresses payback independently of water/sewer savings.",
      "Amazon's publicly filed SBTi commitment and water risk disclosures in its 10-K filing create institutional buying signals beyond the facilities team.",
    ],
    context:
      "San Antonio sits within TWDB Region L, which projects a 21% gap between water supply and demand by 2040 under drought scenarios. Bexar County's water conservation incentive program (active) provides direct financial offset for qualified commercial rainwater reuse systems, reducing net CapEx and improving payback below the 3-year threshold that typically triggers Amazon sustainability capital approvals.",
  },

  financialSnapshot: {
    kpis: [
      {
        label: "Harvestable Gallons",
        value: "7.94M gal/yr",
        sub: "Base case, 30.4\" rainfall",
      },
      {
        label: "Annual Savings",
        value: "$68,400",
        sub: "Water + sewer + stormwater",
      },
      {
        label: "Simple Payback",
        value: "2.9 yrs",
        sub: "After incentives",
      },
      {
        label: "10-yr NPV",
        value: "$332,600",
        sub: "5% discount rate",
      },
      {
        label: "Base ROI",
        value: "106.6%",
        sub: "10-year horizon",
      },
      {
        label: "Confidence-Adj ROI",
        value: "86.3%",
        sub: "Adjusted by 81% CV confidence",
        highlight: true,
      },
      {
        label: "CO₂ Offset",
        value: "25.4 lbs×10³",
        sub: "3.2 lbs per kgal avoided",
      },
      {
        label: "CapEx Midpoint",
        value: "$220,000",
        sub: "$180K – $260K range",
      },
    ],
    confidenceAdjRoiPct: 86.3,
    cvConfidencePct: 81,
    savingsBreakdown: [
      { label: "Water savings",          usd: 33_348 },
      { label: "Sewer savings",          usd: 21_130 },
      { label: "Stormwater avoidance",   usd: 18_400 },
      { label: "Incentive amortization", usd: 2_500  },
    ],
    capexRangeLow: 180_000,
    capexRangeHigh: 260_000,
    incentiveUsd: 25_000,
  },

  esgResilience: {
    headline:
      "Amazon's Net Zero 2040 pledge and water-risk SEC disclosures create a capital-approval pathway beyond the facilities team.",
    bullets: [
      "Amazon is publicly committed to Science Based Targets initiative (SBTi), requiring measurable water stewardship progress at the facility level — rainwater reuse is a direct qualifying intervention.",
      "Bexar County's drought risk index of 4.2/10 is projected to increase to 6.5+ by 2035 under IPCC RCP 4.5 scenarios, elevating long-term operational water-access risk.",
      "Amazon's 2023 10-K explicitly flags water availability as a material operational risk in water-stressed regions — this facility is in scope.",
      "LEED documentation readiness: rainwater reuse systems contribute directly to LEED v4.1 Water Efficiency credits (WEp2, WEc1), relevant if Amazon pursues future certification.",
      "Stormwater management compliance: Bexar County MS4 permit obligations create a regulatory co-benefit from roof capture, reducing peak-flow liability.",
    ],
    sbtiCommitted: true,
    netZeroPledgeYr: 2040,
    secFilingSnippet:
      "Water availability risks may materially affect operations in water-stressed regions. We are actively evaluating on-site conservation and reuse measures across our distribution network.",
  },

  confidenceCaveats: {
    cvConfidencePct: 81,
    keyAssumptions: [
      "Annual rainfall of 30.4\" per NOAA 30-year average for Bexar County — actual year-to-year variance ±15%.",
      "Collection efficiency of 85% assumes clean roof surface and functional first-flush diverter — debris or membrane damage would reduce this.",
      "Cooling tower blowdown substitution assumes 70% discharge fraction; actual ratio depends on system chemistry and current tower operating pressure.",
      "Water rate of $4.20/kgal and sewer rate of $3.80/kgal per SAWS Q1 2026 schedule — subject to annual adjustment.",
      "CapEx midpoint of $220K assumes standard packaged Grundfos CME configuration; structural roof load assessment may adjust this range.",
      "All projections use base-case scenario multipliers. Conservative scenario reduces savings ~20%; upside scenario improves them ~12%.",
    ],
    nextValidationStep:
      "Commission a physical site survey to confirm: (1) roof condition and drainage geometry, (2) cooling tower operational status and blowdown volume logs, (3) available mechanical room footprint for tank and pump installation. A half-day site visit can narrow CapEx range to ±10% and raise CV confidence effectively to 100%, unlocking a final investment brief with binding quote.",
    disclaimer:
      "This brief was generated by the RainUSE Nexus AI engine using satellite-derived building data and public utility rate schedules. All financial projections are estimates based on parameterized models and should not be relied upon as engineering or financial advice. A qualified Grundfos engineer should review all assumptions prior to commercial proposal.",
  },

  nextSteps: {
    steps: [
      {
        order: "1",
        action: "Schedule a physical site survey with the Amazon facilities lead",
        owner: "Grundfos Account Executive",
        horizon: "Week 1–2",
      },
      {
        order: "2",
        action: "Pull SAWS water billing history (12 months) to validate rate assumptions",
        owner: "AE + Customer",
        horizon: "Week 1",
      },
      {
        order: "3",
        action: "File Bexar County conservation incentive pre-application",
        owner: "Grundfos Inside Sales",
        horizon: "Week 2–3",
      },
      {
        order: "4",
        action: "Issue binding CapEx quote and updated investment brief based on survey findings",
        owner: "Grundfos Engineering",
        horizon: "Week 3–4",
      },
      {
        order: "5",
        action: "Present final brief to Amazon Sustainability Capital team",
        owner: "AE + SE",
        horizon: "Week 4–6",
      },
    ],
    closingStatement:
      "This opportunity is time-sensitive. Bexar County's conservation incentive program is currently funded and accepting applications — allocation is first-come, first-served and typically exhausts before Q3. Moving to site survey within 10 business days preserves first-mover position on both the incentive and the capital approval cycle.",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BriefPage({
  params,
}: {
  params: Promise<{ buildingId: string }>;
}) {
  const { buildingId } = await params;

  // Fallback to the stub building if the id is not in mock set
  const building = MOCK_BUILDINGS[buildingId] ?? MOCK_BUILDINGS["bld_stub_001"];

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">

      {/* ── Full-width header ──────────────────────────────── */}
      <BriefHeader
        address={building.address}
        metro={building.metro}
        state={building.state}
        buildingType={building.buildingType}
        ownerTenant={building.ownerTenant}
        viabilityScore={building.viabilityScore}
        recommendedAngle={building.recommendedAngle}
        generatedAt={MOCK_BRIEF.generatedAt}
        buildingId={MOCK_BRIEF.buildingRef}
      />

      {/* ── Two-column body ───────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left — satellite/evidence panel */}
        <div className="w-[380px] xl:w-[420px] shrink-0 flex flex-col border-r border-gray-800 overflow-hidden">
          <SatellitePanel
            address={building.address}
            lat={building.lat}
            lng={building.lng}
            roofAreaSqft={building.roofAreaSqft}
            coolingTowerCount={building.coolingTowerCount}
            cvConfidencePct={building.cvConfidencePct}
            urgencyScore={building.urgencyScore}
            imageryDate={building.imageryDate}
            imagerySource={building.imagerySource}
            imageryUrl={building.imageryUrl}
          />
        </div>

        {/* Right — report document */}
        <div className="flex-1 overflow-y-auto bg-slate-100">
          {/* Subtle document shadow / paper effect */}
          <div className="max-w-3xl mx-auto my-6 shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-200">
            <BriefReport data={MOCK_BRIEF} />
          </div>
        </div>
      </div>
    </div>
  );
}
