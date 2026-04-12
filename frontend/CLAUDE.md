# CLAUDE.md

## Project
RainUSE Nexus Frontend — Prospecting Map and Candidate Explorer

## Goal
Build the frontend experience for RainUSE Nexus, a web-based prospecting engine for commercial rainwater and non-potable reuse opportunities.

This frontend is the primary product surface for the demo. It must present a clear drill-down flow from national market opportunity to state/metro analysis to building-level candidate inspection, then hand the selected building record into the ROI and AI brief pipeline.

The frontend is not responsible for recomputing scores or performing live CV inference. It visualizes precomputed outputs and orchestrates user flow into backend decision tools.

---

## Product framing
This is not “just a map.” It is the operating interface for the prospecting engine.

The frontend represents three upstream layers:

1. **Layer 1 — Market Readiness**
   - State and metro-level opportunity scoring
   - Shown through choropleth + ranked metro panels

2. **Layer 2 — Building Candidates**
   - Curated commercial / industrial building targets
   - Ranked by viability score
   - Filterable and drillable

3. **Layer 3 — CV / Satellite Evidence**
   - Precomputed roof polygon
   - Cooling tower detection indicators
   - CV confidence score
   - Imagery metadata and visual overlay

The app should make it obvious that the user is progressively narrowing from broad market opportunity to a specific building candidate with physical evidence.

---

## Core user flow

### Main flow
1. User lands on a national US map
2. States are color-coded by Market Readiness Score
3. User hovers a state and sees tooltip with score + top drivers
4. User clicks a state
5. Right sidebar updates with state summary + ranked metros
6. User clicks a metro
7. Map zooms to metro and shows building candidates
8. User filters candidates
9. User clicks a building
10. Building detail panel opens with:
    - summary
    - viability score
    - CV confidence
    - satellite / evidence view
11. User clicks “Analyze ROI”
12. Frontend passes selected building record to backend ROI endpoint
13. User clicks “Generate Investment Brief”
14. Frontend passes building record + ROI output to backend brief endpoint

### Demo flow
Country → State → Metro → Building → ROI → Brief

This flow must feel smooth and deterministic.

---

## Frontend responsibilities
The frontend owns:

- national map rendering
- state choropleth
- metro drill-down UI
- building candidate rendering
- filter controls
- selected building profile display
- CV evidence overlay display
- routing / state orchestration between map and downstream ROI/brief actions
- calling backend endpoints for ROI and brief generation
- rendering responses from backend

The frontend does **not** own:

- viability score calculation
- market score calculation
- ROI math
- brief generation logic
- live CV inference
- data enrichment or recomputation

---

## Technical stack
Preferred stack:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **MapLibre GL JS**
- **shadcn/ui** for UI primitives
- optional **Zustand** for shared selection state

Fallback map stack if needed:
- React Leaflet

Primary recommendation is MapLibre because the app is map-first and needs polished layer-based rendering.

---

## Key architecture rule
The frontend must treat the **Building Candidate Record** as the source of truth for building-level data.

Do not create parallel frontend-only interpretations of building data.
Do not duplicate ROI logic in the client.
Do not mutate score semantics in the UI.

The UI should read and present shared data objects cleanly.

---

## Data contracts

### 1. state_scores.json
Used for national and state-level market exploration.

Expected shape:
```ts
type StateScoreRecord = {
  state_id: string
  state_name: string
  market_readiness_score: number
  top_drivers: string[]
  score_breakdown: {
    water_cost_pressure: number
    rainfall_availability: number
    building_density: number
    regulatory_friendliness: number
    drought_resilience_pressure: number
  }
  metros: MetroSummary[]
}

type MetroSummary = {
  metro_id: string
  metro_name: string
  score: number
  top_drivers: string[]
}
2. buildings.json

Used for metro and building-level exploration.

Expected shape:

type BuildingCandidateRecord = {
  building_id: string
  address: string
  lat: number
  lng: number
  metro: string
  state: string
  building_type: string
  owner_tenant: string

  roof_area_sqft: number
  roof_geometry: GeoJSON.Geometry | GeoJSON.Feature | GeoJSON.FeatureCollection
  cooling_tower_present: boolean
  cooling_tower_count: number
  cv_confidence_score: number
  imagery_date: string
  imagery_source: string

  annual_rainfall_in: number
  harvestable_gal_yr: number
  drought_risk_index: number
  flood_risk_index: number
  water_restriction_active: boolean
  water_stress_tier: string

  water_rate_per_kgal: number
  sewer_rate_per_kgal: number
  annual_water_savings_usd: number
  annual_sewer_savings_usd: number
  incentive_value_usd: number
  system_capex_range: [number, number]
  simple_payback_yrs: number
  npv_10yr_usd: number
  confidence_adj_roi: number

  stormwater_fee_active: boolean
  stormwater_fee_usd_yr: number
  state_incentive_type: string
  permit_pathway: string
  regulatory_urgency: number

  sbti_committed: boolean
  net_zero_pledge_yr: number | null
  leed_certified: boolean
  esg_score_proxy: number
  water_risk_in_10k: boolean
  sec_filing_snippet: string

  urgency_score: number
  urgency_drivers: string[]
  recommended_angle: "cost_savings" | "resilience" | "compliance" | "esg_credibility"
  viability_score: number
}
3. Backend endpoints

The frontend must integrate with:

POST /roi/calculate
POST /brief/generate

The frontend should pass the selected building record or a backend-expected subset of it.

UX requirements
Overall layout

Desktop layout should use 3 zones:

Left sidebar
filters
selected geography summary
ranked lists
Center map
main interactive exploration surface
Right panel or drawer
building profile
evidence viewer
ROI/brief actions

The app should still be responsive, but desktop demo quality matters most.

National map mode

Show:

US state polygons
choropleth by Market Readiness Score
hover tooltip:
state name
score
top 3 drivers
State mode

On click:

zoom to state
update sidebar with:
state score
breakdown bars
ranked metros
Metro mode

On metro click:

zoom to metro extent
show candidate buildings
activate building filters
Building mode

On building click:

highlight building on map
open building detail panel
show:
address
type
roof area
viability score
CV confidence
urgency
recommended sales angle
show CTA buttons:
Analyze ROI
Generate Brief
CV / satellite evidence requirements

Layer 3 must be visibly represented.

The frontend must support displaying:

roof polygon overlay
cooling tower marker / bounding indicator
imagery date
imagery source
CV confidence score

Important:
The app must not imply live inference. It should present these as preprocessed physical detection outputs.

Recommended wording in UI:

“Preprocessed from satellite imagery”
“Detection confidence”
“Imagery source/date”
Preferred implementation

Use a building evidence panel with:

mini satellite-style map or evidence viewport
roof geometry overlay
cooling tower overlay
metadata chips

This evidence panel should visually justify why the building is a valid candidate.

Filters

At the building candidate level, support these filters:

roofs above threshold
cooling-tower-positive only
high water-cost metros
ESG-prioritized companies

Optional extras if time permits:

viability score minimum
CV confidence minimum
building type

Filters must update:

map markers/polygons
candidate list
selected counts
Frontend state model

Use a centralized selection state.

Suggested shape:

type AppSelectionState = {
  selectedStateId: string | null
  selectedMetroId: string | null
  selectedBuildingId: string | null
  mapMode: "national" | "state" | "metro" | "building"
  filters: {
    roofAboveThreshold: boolean
    coolingTowerOnly: boolean
    highWaterCostOnly: boolean
    esgPrioritizedOnly: boolean
  }
}

This state should drive:

what the map renders
what side panels render
what data is filtered
what backend calls are enabled
Component plan
Top-level
ProspectingDashboard
AppShell
SelectionStoreProvider or Zustand store
Map components
NationalChoroplethMap
StateLayer
MetroLayer
BuildingCandidateLayer
SelectedBuildingHighlight
CvEvidenceOverlay
Sidebar / panels
FilterPanel
StateSummaryPanel
MetroRankPanel
BuildingListPanel
BuildingProfilePanel
EvidenceViewerPanel
UI primitives
ScoreBadge
ConfidenceChip
DriverTag
MetricRow
EmptyState
LoadingState
Integration components
AnalyzeRoiButton
GenerateBriefButton
Visual style guidance

The UI should feel like an enterprise intelligence product, not a hacky student map.

Design goals:

dark or neutral professional palette
restrained but high-contrast score colors
clean cards and panels
strong typography hierarchy
minimal clutter on map
filters easy to understand
no unnecessary animations

The map should remain legible even when multiple layers are active.

Interaction design principles
The user must always know what scope they are in:
national
state
metro
building
Selection changes should update both map and side panel
Candidate selection should feel instant
The building panel should feel like the bridge into ROI + brief workflows
Confidence should be visible, not hidden
Backend integration expectations

The frontend should make backend calls only when needed.

ROI trigger

When a user clicks “Analyze ROI”:

send selected building record or id to /roi/calculate
display loading state
display returned metrics
Brief trigger

When user clicks “Generate Investment Brief”:

use selected building + ROI output
send to /brief/generate
display structured returned brief

Do not block the entire app on these calls.
Only the relevant panel should show a loading state.

File and folder guidance

Suggested frontend structure:

src/
  app/
    page.tsx
    dashboard/
      page.tsx

  components/
    dashboard/
      ProspectingDashboard.tsx
      FilterPanel.tsx
      StateSummaryPanel.tsx
      MetroRankPanel.tsx
      BuildingListPanel.tsx
      BuildingProfilePanel.tsx
      EvidenceViewerPanel.tsx

    map/
      NationalChoroplethMap.tsx
      StateLayer.tsx
      MetroLayer.tsx
      BuildingCandidateLayer.tsx
      CvEvidenceOverlay.tsx

    ui/
      ScoreBadge.tsx
      ConfidenceChip.tsx
      DriverTag.tsx

  lib/
    api.ts
    formatters.ts
    map/
      colorScales.ts
      layerHelpers.ts
    data/
      loaders.ts
      selectors.ts

  store/
    selectionStore.ts

  types/
    state.ts
    building.ts
    roi.ts
    brief.ts
Implementation order

Build in this exact order:

national state choropleth
state click interaction + state summary panel
metro list + metro map focus
building candidate list + building markers
selected building profile panel
CV evidence viewer
filter controls
backend wiring for ROI
backend wiring for brief
polish + loading states + error handling

This order ensures something demoable early.

Constraints
No live CV inference in the browser
No live external data fetches during demo if avoidable
Use precomputed JSON wherever possible
Keep map interactions smooth and deterministic
Keep score semantics faithful to backend/data definitions
Pitfalls to avoid

Do not:

recompute viability score on the client
invent frontend-only score logic
overcrowd the map with all layers at once
hide confidence / caveats
tightly couple map rendering to temporary mock fields
imply that satellite CV runs live
Success criteria

This frontend is successful if a judge can:

understand which states are attractive
drill into a promising metro
inspect a building candidate
see physical evidence from the CV layer
trust that this candidate can now flow into ROI and AI brief generation

The frontend should make the product feel like a real prospecting platform rather than a dashboard.

Preferred tone for frontend implementation
product-grade
clean
enterprise
credible
fast
minimal but insightful

When in doubt, optimize for clarity over visual flash.