# GEMINI.md

## Project
**RainUSE Nexus — Prospect-to-Proposal Engine**  
Hackathon track: Rainwater and stormwater management / Grundfos water reuse

## Objective
Build the **frontend** for a web-based prototype that identifies high-potential commercial buildings for rainwater and non-potable reuse, ranks them by market and building viability, shows CV/satellite evidence, and hands the selected building record off to:
1. an ROI engine
2. an AI investment brief generator

This frontend is **not** a generic dashboard. It is the primary exploration interface for a **prospecting engine**.

---

# Product framing

This product is built around **one central data object**:

## Building Candidate Record
The map explores it.  
The ROI calculator quantifies it.  
The AI brief sells it.

The frontend must be built so that:
- selecting a building on the map opens its profile
- the selected building can be passed directly into the ROI API
- ROI results can then be passed into the AI brief API

---

# Core UX flow

The app should support this drill-down flow:

**Country → State → Metro → Building → ROI → AI Brief**

### Primary user story
A user opens the map, sees the national opportunity landscape, drills into a state, explores top metros, selects a high-value candidate building, reviews physical/CV evidence, then sends that building into the ROI and AI brief workflow.

---

# Tech stack requirements

Use the following frontend stack unless there is a strong reason not to:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **MapLibre GL JS**

Optional:
- **shadcn/ui** for cards, tabs, drawers, badges, buttons
- **Zustand** if shared state becomes messy

## Why this stack
- Next.js + TypeScript gives a fast, organized app structure
- Tailwind is fast for hackathon UI iteration
- MapLibre is open-source and works well with:
  - GeoJSON layers
  - choropleth state rendering
  - building polygons
  - source/layer based rendering
  - future raster/image overlay support

---

# Non-goals

Do **not** build:
- live CV inference in the frontend
- live building generation
- complex GIS editing features
- a full CRM
- heavy animation systems
- fancy but brittle map effects

Do **not** compute ROI in the frontend.

Do **not** invent or transform building fields beyond display logic and filtering.

---

# Data model context

All frontend views should read from **precomputed static JSON** and backend APIs.

## Static data files
These should be treated as the source of truth for demo-time exploration:

- `/public/data/state_scores.json`
- `/public/data/buildings.json`
- `/public/data/states.geojson`

Potential future optional files:
- `/public/data/metros.geojson`
- `/public/data/cv_overlays/<building_id>.json`
- `/public/data/imagery/<building_id>.png`

---

# Required app architecture

Build the app as **one dashboard page** with structured subcomponents.

## Layout
Desktop layout should be a 3-panel experience:

- **Left panel**: filters, breadcrumbs, mode-specific navigation
- **Center panel**: main interactive map
- **Right panel**: details panel that changes based on current selection

This layout is critical. The app should feel like a real prospecting tool.

---

# Required application states

The frontend must track:

```ts
type MapMode = "national" | "state" | "metro" | "building";

type Filters = {
  roofAboveThreshold: boolean;
  coolingTowerOnly: boolean;
  highWaterCostOnly: boolean;
  esgPrioritizedOnly: boolean;
};

type SelectionState = {
  selectedState: string | null;
  selectedMetro: string | null;
  selectedBuildingId: string | null;
  mapMode: MapMode;
  filters: Filters;
};
```

Use local state first. Add Zustand only if necessary.

---

# Required TypeScript contracts

Create frontend types that mirror the backend/data contracts exactly.

## `types/building.ts`

```ts
export type BuildingCandidate = {
  building_id: string;
  address: string;
  lat: number;
  lng: number;
  metro: string;
  state: string;
  building_type: string;
  owner_tenant?: string;

  roof_area_sqft: number;
  roof_geometry: GeoJSON.Geometry;
  cooling_tower_present: boolean;
  cooling_tower_count: number;
  cv_confidence_score: number;
  imagery_date?: string;
  imagery_source?: string;
  imagery_url?: string;

  annual_rainfall_in: number;
  harvestable_gal_yr: number;
  drought_risk_index: number;
  flood_risk_index: number;
  water_restriction_active?: boolean;
  water_stress_tier?: string;

  water_rate_per_kgal: number;
  sewer_rate_per_kgal: number;
  annual_water_savings_usd: number;
  annual_sewer_savings_usd: number;
  incentive_value_usd: number;
  system_capex_range: [number, number];
  simple_payback_yrs: number;
  npv_10yr_usd: number;
  confidence_adj_roi: number;

  stormwater_fee_active?: boolean;
  stormwater_fee_usd_yr?: number;
  state_incentive_type?: string;
  permit_pathway?: string;
  regulatory_urgency?: number;

  sbti_committed?: boolean;
  net_zero_pledge_yr?: number;
  leed_certified?: boolean;
  esg_score_proxy?: number;
  water_risk_in_10k?: boolean;
  sec_filing_snippet?: string;

  urgency_score: number;
  urgency_drivers: string[];
  recommended_angle: "cost_savings" | "resilience" | "compliance" | "esg_credibility";
  viability_score: number;
};
```

## `types/state.ts`

```ts
export type MetroScore = {
  metro: string;
  state: string;
  market_readiness_score: number;
  top_drivers: string[];
};

export type StateScore = {
  state: string;
  state_code: string;
  market_readiness_score: number;
  top_drivers: string[];
  metros: MetroScore[];
};
```

---

# Backend integration requirements

The frontend must integrate with two backend endpoints:

## ROI endpoint
`POST /roi/calculate`

Input:
- selected building record
- optional overrides later if needed

Output:
- annual harvestable gallons
- annual water savings
- annual sewer savings
- CAPEX range
- payback
- NPV
- base ROI
- confidence-adjusted ROI
- scenario range

## Brief endpoint
`POST /brief/generate`

Input:
- selected building record
- ROI results

Output:
- structured investment brief JSON

The frontend should call ROI first, then Brief.

---

# Required screens / modes

## 1. National mode
This is the landing experience.

### Must show
- US map
- states shaded by **Market Readiness Score**
- hover tooltip with:
  - state name
  - score
  - top 3 drivers
- legend
- short explanation of what the colors mean

### On click
Clicking a state should:
- set `selectedState`
- update `mapMode` to `"state"`
- zoom to the state
- populate the right panel with the state summary and metro rankings

---

## 2. State mode

### Must show
- selected state highlighted
- metro list in right panel
- state score summary
- score breakdown style visualization if possible
- top metros ranked by readiness

### On click
Clicking a metro should:
- set `selectedMetro`
- update `mapMode` to `"metro"`
- zoom to the buildings for that metro
- show building candidates

---

## 3. Metro mode

### Must show
- candidate buildings for selected metro
- a sortable list of buildings in the right panel
- filters in the left panel

### Building list columns
- address
- building type
- roof area
- CV confidence
- viability score

### On click
Clicking a building should:
- highlight it on the map
- set `selectedBuildingId`
- update `mapMode` to `"building"`
- open building profile in the right panel

---

## 4. Building mode

This is where the app becomes a prospecting engine.

### Must show
- building profile card
- roof area
- viability score
- urgency score
- CV confidence
- recommended sales angle
- urgency drivers
- buttons:
  - `Analyze ROI`
  - `Generate Brief`

Also include a **CV / satellite evidence section**.

---

# CV / satellite evidence requirements

The frontend must represent the precomputed CV layer honestly.

### Important
Do **not** imply live CV inference.

The UI should clearly indicate that this was:
- preprocessed from imagery
- associated with an imagery date
- generated from a CV/geospatial preprocessing pipeline

## Required visual evidence section
When a building is selected, show a dedicated evidence panel/card containing:

- satellite image or imagery preview
- roof polygon overlay
- cooling tower overlay or badge
- imagery source
- imagery date
- CV confidence score

This evidence section can be:
1. a mini embedded map, or
2. a static image card with SVG overlay

For hackathon speed, a separate detail card is acceptable and preferred.

---

# Map implementation requirements

Use **MapLibre GL JS**.

## Source/layer strategy
Build the map using separate data sources and layers:

### Source 1 — states
- `states-source`
- used for national choropleth

### Source 2 — buildings
- `buildings-source`
- used for metro and building candidate views

### Source 3 — selected building overlay
- `selected-building-source`
- used to highlight selected building footprint or point

### Optional source 4 — CV overlay
- roof polygon / cooling tower geometry / raster/image support

---

# Required map behavior

## National map
- center on continental US
- zoom level appropriate for state comparison
- states filled by readiness score
- outlines visible

## State interaction
- clicking state zooms/fits to state bounds
- right panel updates

## Metro interaction
- clicking metro or selecting from list filters buildings
- map zooms to metro area / candidate extent

## Building interaction
- selecting building highlights it
- map centers or flies to selected candidate
- right panel updates to building mode

---

# Filtering requirements

The left panel must support the following toggles:

- `Roofs above threshold`
- `Cooling-tower positive`
- `High water-cost metros`
- `ESG-prioritized companies`

These filters should affect:
- building list
- map features shown

Filters do not need to affect state-level choropleth colors.

---

# Visual design requirements

The app should feel modern, clean, and product-grade.

## Desired design
- dark or light theme is fine
- strong card hierarchy
- readable typography
- clean spacing
- map is the centerpiece
- side panels should not feel cramped

## Use UI patterns like
- cards
- tabs
- badges
- chips
- tooltips
- drawers or expandable detail sections

---

# Required component tree

Use this as the base structure:

```text
app/
  page.tsx

components/
  dashboard/
    ProspectingDashboard.tsx
    LeftPanel.tsx
    RightPanel.tsx

  map/
    MainMap.tsx
    StateLayer.tsx
    MetroLayer.tsx
    BuildingLayer.tsx
    SelectedBuildingLayer.tsx
    CvOverlayLayer.tsx

  panels/
    StateSummaryPanel.tsx
    MetroSummaryPanel.tsx
    BuildingListPanel.tsx
    BuildingProfilePanel.tsx
    CvEvidencePanel.tsx
    RoiPreviewPanel.tsx
    BriefPreviewPanel.tsx

  filters/
    FilterPanel.tsx

lib/
  api.ts
  map.ts
  format.ts
  selectors.ts

types/
  building.ts
  state.ts
  roi.ts
  brief.ts
```

---

# Required implementation order

Build in this exact order unless there is a strong reason not to:

## Phase 1 — foundation
- [x] 1. Create Next.js app with TypeScript
- [x] 2. Install Tailwind + MapLibre
- [x] 3. Set up app shell with 3-panel layout
- [x] 4. Add TypeScript data models
- [x] 5. Load static JSON successfully

## Phase 2 — map MVP
- [ ] 6. Render a working MapLibre map
- [x] 7. Add state GeoJSON source (Optimized continental geometry generated)
- [ ] 8. Render national choropleth
- [ ] 9. Add hover tooltip
- [ ] 10. Add state click behavior
- [ ] 11. Update right panel when a state is selected

## Phase 3 — drill-down
- [ ] 12. Add metro ranking panel
- [x] 13. Add building data source (Mock building payload configured)
- [ ] 14. Render candidate points or polygons (Map layers pending)
- [x] 15. Add building list panel (Iterates on fetched static JSON)
- [x] 16. Add building click selection
- [ ] 17. Add selected building highlight

## Phase 4 — building intelligence
- [x] 18. Add building profile panel (Dynamically rendering mock statistics)
- [x] 19. Add CV evidence panel (Contains live MapLibre Satellite view)
- [x] 20. Show imagery metadata, confidence, overlays (Built precise GeoJSON outlines and markers)
- [ ] 21. Add ROI button
- [ ] 22. Add Brief button

## Phase 5 — backend integration
- [ ] 23. Wire `POST /roi/calculate`
- [ ] 24. Render ROI response in preview panel
- [ ] 25. Wire `POST /brief/generate`
- [ ] 26. Render structured brief preview panel

## Phase 6 — filters and polish
- [x] 27. Add filters (Filter toggles state initialized)
- [ ] 28. Add legends and score chips
- [ ] 29. Add fitBounds / flyTo polish
- [ ] 30. Add loading states and error handling

---

# API helper requirements

Create a simple API layer.

## `lib/api.ts`

```ts
export async function loadBuildings() {
  const res = await fetch("/data/buildings.json");
  if (!res.ok) throw new Error("Failed to load buildings");
  return res.json();
}

export async function loadStateScores() {
  const res = await fetch("/data/state_scores.json");
  if (!res.ok) throw new Error("Failed to load state scores");
  return res.json();
}

export async function loadStatesGeoJSON() {
  const res = await fetch("/data/states.geojson");
  if (!res.ok) throw new Error("Failed to load states GeoJSON");
  return res.json();
}

export async function calculateRoi(building: unknown) {
  const res = await fetch("http://localhost:8000/roi/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(building),
  });

  if (!res.ok) throw new Error("Failed to calculate ROI");
  return res.json();
}

export async function generateBrief(payload: unknown) {
  const res = await fetch("http://localhost:8000/brief/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to generate brief");
  return res.json();
}
```

---

# Implementation details and guidance

## State choropleth
Use state GeoJSON + `state_scores.json` joined by state code.

Render a fill layer where color is determined by `market_readiness_score`.

Tooltip content:
- state name
- score
- top drivers

## Metro view
Start with a right-panel metro list if metro polygons are unavailable.

Do not block progress on metro boundary rendering.

## Building rendering
Start by rendering buildings as points for selection/debugging.

After that works, upgrade to footprint polygons using `roof_geometry`.

## Building profile panel
Must include:
- address
- metro/state
- building type
- roof area
- viability score
- urgency score
- CV confidence
- recommended angle
- urgency drivers

## ROI / Brief handoff
The selected building record should be the exact object passed to the ROI API.

The ROI response should then feed into the Brief API.

---

# What success looks like

A user should be able to understand the product in under 10 seconds:

1. This map shows which states are attractive
2. Clicking a state reveals the best metros
3. Clicking a metro reveals target buildings
4. Clicking a building shows why it is a good candidate
5. Physical evidence is visible
6. The user can then calculate ROI and generate an AI brief

That is the target experience.

---

# Quality bar

The frontend should feel:
- deliberate
- clean
- interactive
- connected to the data pipeline
- useful to a sales or strategy user

It should **not** feel like a generic GIS demo.

---

# Constraints

- All exploration data is precomputed offline
- No live CV inference
- No live market recomputation
- Focus on reliability, clarity, and interaction quality
- Prefer a polished end-to-end flow over extra features

---

# If time runs short

If there is not enough time, prioritize:

1. national map choropleth
2. state click → metro/building list
3. building selection
4. building profile panel
5. CV evidence panel
6. ROI button
7. Brief button

That is the minimum demoable frontend.

---

# Final instruction to coding agent

Build this frontend as a **product-grade exploration interface for a scored building prospecting engine**.  
Keep the code modular, typed, readable, and easy to iterate on.  
Prioritize the end-to-end user flow over edge-case completeness.

Do not invent product behavior outside this spec unless it clearly improves the drill-down experience.
