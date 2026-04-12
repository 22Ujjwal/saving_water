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
  // Use the newly optimized subset of continental states
  // The choropleth uses 'feature.properties.postal' mapping to 'state_code' in state_scores.json
  const res = await fetch("/data/states.optimized.geojson");
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
