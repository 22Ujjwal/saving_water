"use client";
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SelectionState } from "../dashboard/ProspectingDashboard";
import { BuildingCandidate } from "@/types/building";
import { StateScore } from "@/types/state";
import { FeatureCollection } from "geojson";
import {
  getOpportunityColor,
  getOpportunityTier,
  scoreStateOpportunity,
  LEGEND_ITEMS,
} from "@/lib/stateOpportunity";

type MainMapProps = {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
  filteredBuildings: BuildingCandidate[];
  stateScores: StateScore[];
  statesGeo: FeatureCollection | null;
};

type TooltipState = {
  x: number;
  y: number;
  stateName: string;
  score: number | null;
  tier: string;
  candidateCount: number;
  avgSavings: number | null;
  avgRainfall: number | null;
  topDrivers: string[];
};

// Pseudo-random offsets to spread cooling tower markers around building centroid
const COOLING_TOWER_OFFSETS = [
  [0.00005,  0.00005],
  [-0.00008, 0.00002],
  [0.00002, -0.00006],
  [-0.00005,-0.00005],
  [0.0001,   0],
  [0,        0.0001],
];

function getBounds(buildings: BuildingCandidate[]): [number, number, number, number] | null {
  if (buildings.length === 0) return null;
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const b of buildings) {
    if (b.lng < minLng) minLng = b.lng;
    if (b.lng > maxLng) maxLng = b.lng;
    if (b.lat < minLat) minLat = b.lat;
    if (b.lat > maxLat) maxLat = b.lat;
  }
  return [minLng, minLat, maxLng, maxLat];
}

export default function MainMap({ selection, setSelection, filteredBuildings, stateScores, statesGeo }: MainMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);
  const [tooltip, setTooltip] = React.useState<TooltipState | null>(null);

  // ── Initialize map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      pitchWithRotate: false,
      dragRotate: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.current.on("load", () => {
      if (!map.current) return;

      // ── Sources ────────────────────────────────────────────────────────────

      map.current!.addSource("satellite-source", {
        type: "raster",
        tiles: [
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Esri World Imagery",
      });

      map.current!.addSource("states-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current!.addSource("buildings-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current!.addSource("roof-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current!.addSource("cooling-towers-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // ── Layers — bottom to top ─────────────────────────────────────────────

      // 1. Satellite basemap — always on
      map.current!.addLayer({
        id: "satellite-layer",
        type: "raster",
        source: "satellite-source",
        layout: { visibility: "visible" },
      });

      // 2. State choropleth fill — national view only
      map.current!.addLayer({
        id: "states-fill",
        type: "fill",
        source: "states-source",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.85,
            0.65,
          ],
        },
      });

      // 3. State choropleth outline — thicker + darker for selected state
      map.current!.addLayer({
        id: "states-line",
        type: "line",
        source: "states-source",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "isSelected"], 1],
            "#0F172A",
            "rgba(255,255,255,0.45)",
          ],
          "line-width": [
            "case",
            ["==", ["get", "isSelected"], 1],
            2.5,
            0.7,
          ],
        },
      });

      // 4. Roof polygon fill — building view only
      map.current!.addLayer({
        id: "roof-fill",
        type: "fill",
        source: "roof-source",
        layout: { visibility: "none" },
        paint: { "fill-color": "#3b82f6", "fill-opacity": 0.3 },
      });

      // 5. Roof polygon outline
      map.current!.addLayer({
        id: "roof-outline",
        type: "line",
        source: "roof-source",
        layout: { visibility: "none" },
        paint: { "line-color": "#3b82f6", "line-width": 2 },
      });

      // 6. Building markers
      map.current!.addLayer({
        id: "buildings-circle",
        type: "circle",
        source: "buildings-source",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            4, 2, 12, 6, 18, 12,
          ],
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#f59e0b",
            "#2563eb",
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.8,
        },
      });

      // 7. Cooling tower circles — building view only
      map.current!.addLayer({
        id: "cooling-towers-circle",
        type: "circle",
        source: "cooling-towers-source",
        layout: { visibility: "none" },
        paint: {
          "circle-radius": 7,
          "circle-color": "#22c55e",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#166534",
          "circle-opacity": 0.9,
        },
      });

      // ── Events ─────────────────────────────────────────────────────────────

      let hoveredStateId: string | null = null;

      map.current!.on("mousemove", "states-fill", (e) => {
        if (!e.features?.length) return;
        map.current!.getCanvas().style.cursor = "pointer";

        // Hover glow
        if (hoveredStateId !== null) {
          map.current!.setFeatureState(
            { source: "states-source", id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = e.features[0].id as string;
        map.current!.setFeatureState(
          { source: "states-source", id: hoveredStateId },
          { hover: true }
        );

        // Tooltip — all data was baked into feature properties during enrichment
        const props = e.features[0].properties as Record<string, unknown>;
        const rawScore = props.score;
        const score = rawScore != null && rawScore !== "" ? Number(rawScore) : null;
        const candidateCount = Number(props.candidateCount ?? 0);
        const avgSavings = props.avgSavings != null && props.avgSavings !== "" ? Number(props.avgSavings) : null;
        const avgRainfall = props.avgRainfall != null && props.avgRainfall !== "" ? Number(props.avgRainfall) : null;
        let topDrivers: string[] = [];
        try {
          topDrivers = JSON.parse(String(props.topDrivers ?? "[]"));
        } catch {
          topDrivers = [];
        }

        setTooltip({
          x: e.point.x,
          y: e.point.y,
          stateName: String(props.stateName ?? props.stateCode ?? "Unknown"),
          score,
          tier: String(props.tier ?? "No Data"),
          candidateCount,
          avgSavings,
          avgRainfall,
          topDrivers,
        });
      });

      map.current!.on("mouseleave", "states-fill", () => {
        map.current!.getCanvas().style.cursor = "";
        if (hoveredStateId !== null) {
          map.current!.setFeatureState(
            { source: "states-source", id: hoveredStateId },
            { hover: false }
          );
          hoveredStateId = null;
        }
        setTooltip(null);
      });

      map.current!.on("click", "states-fill", (e) => {
        if (!e.features?.length) return;
        const code = e.features[0].properties.stateCode;
        setSelection(prev => ({
          ...prev,
          selectedState: code,
          mapMode: "state",
          selectedMetro: null,
          selectedBuildingId: null,
        }));
      });

      map.current!.on("mouseenter", "buildings-circle", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });
      map.current!.on("mouseleave", "buildings-circle", () => {
        map.current!.getCanvas().style.cursor = "";
      });
      map.current!.on("click", "buildings-circle", (e) => {
        if (!e.features?.length) return;
        const buildingId = e.features[0].properties.building_id;
        setSelection(prev => ({
          ...prev,
          selectedBuildingId: buildingId,
          mapMode: "building",
        }));
      });

      setIsMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapLoaded(false);
      }
    };
  }, [setSelection]);

  // ── Update state choropleth data ───────────────────────────────────────────
  // Bakes all tooltip-needed data into GeoJSON feature properties so map event
  // handlers can read them without needing React state refs.
  useEffect(() => {
    if (!isMapLoaded || !map.current || !statesGeo || stateScores.length === 0) return;

    const selectedCode = selection.selectedState;

    const enrichedFeatures = statesGeo.features.map((feature, idx) => {
      const stateCode = feature.properties?.postal || feature.properties?.name;
      const s = stateScores.find(
        x => x.state_code === stateCode || x.state === stateCode
      );

      // scoreStateOpportunity derives from score_breakdown sub-scores for
      // visual range; the raw pipeline score is still shown in the tooltip.
      const score  = s ? scoreStateOpportunity(s) : null;
      const tier   = getOpportunityTier(score);
      const color  = getOpportunityColor(score);
      const isSelected = (s?.state_code === selectedCode || s?.state === selectedCode) ? 1 : 0;

      return {
        ...feature,
        id: feature.id ?? idx,
        properties: {
          ...feature.properties,
          // Identification
          stateCode:      s?.state_code ?? stateCode,
          stateName:      s?.state      ?? stateCode,
          // Score / tier
          score,
          tier:           tier.label,
          color,
          isSelected,
          // Tooltip metrics (from pipeline-computed aggregates in state_scores.json)
          candidateCount: s?.candidate_count        ?? 0,
          avgSavings:     s?.avg_annual_savings_usd ?? null,
          avgRainfall:    s?.avg_annual_rainfall_in ?? null,
          topDrivers:     JSON.stringify(s?.top_drivers ?? []),
        },
      };
    });

    const source = map.current.getSource("states-source") as maplibregl.GeoJSONSource;
    source?.setData({ type: "FeatureCollection", features: enrichedFeatures });
  }, [isMapLoaded, statesGeo, stateScores, selection.selectedState]);

  // ── Update building marker data ────────────────────────────────────────────
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;

    const features: GeoJSON.Feature<GeoJSON.Point>[] = filteredBuildings.map(b => ({
      type: "Feature",
      id: b.building_id,
      geometry: { type: "Point", coordinates: [b.lng, b.lat] },
      properties: { building_id: b.building_id, viability: b.viability_score },
    }));

    const source = map.current.getSource("buildings-source") as maplibregl.GeoJSONSource;
    source?.setData({ type: "FeatureCollection", features });
  }, [isMapLoaded, filteredBuildings]);

  // ── Toggle layer visibility based on mapMode ───────────────────────────────
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;

    const showChoropleth = selection.mapMode === "national";
    const showOverlays   = selection.mapMode === "building";

    const setVis = (id: string, visible: boolean) => {
      if (map.current!.getLayer(id)) {
        map.current!.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      }
    };

    setVis("states-fill",           showChoropleth);
    setVis("states-line",           showChoropleth);
    setVis("roof-fill",             showOverlays);
    setVis("roof-outline",          showOverlays);
    setVis("cooling-towers-circle", showOverlays);
  }, [isMapLoaded, selection.mapMode]);

  // ── Update roof + cooling tower overlays ───────────────────────────────────
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;

    const roofSrc = map.current.getSource("roof-source") as maplibregl.GeoJSONSource;
    const ctSrc   = map.current.getSource("cooling-towers-source") as maplibregl.GeoJSONSource;
    const empty: FeatureCollection = { type: "FeatureCollection", features: [] };

    if (!selection.selectedBuildingId) {
      roofSrc?.setData(empty);
      ctSrc?.setData(empty);
      return;
    }

    const building = filteredBuildings.find(b => b.building_id === selection.selectedBuildingId);
    if (!building) return;

    if (roofSrc && building.roof_geometry) {
      roofSrc.setData({
        type: "Feature",
        geometry: building.roof_geometry,
        properties: {},
      });
    }

    if (ctSrc) {
      const ctFeatures: GeoJSON.Feature<GeoJSON.Point>[] = building.cooling_tower_present
        ? Array.from({ length: Math.min(building.cooling_tower_count, 6) }, (_, i) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [
                building.lng + (COOLING_TOWER_OFFSETS[i]?.[0] ?? 0),
                building.lat + (COOLING_TOWER_OFFSETS[i]?.[1] ?? 0),
              ],
            },
            properties: { index: i },
          }))
        : [];
      ctSrc.setData({ type: "FeatureCollection", features: ctFeatures });
    }
  }, [isMapLoaded, selection.selectedBuildingId, filteredBuildings]);

  // ── Sync selected building highlight ──────────────────────────────────────
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;

    try {
      filteredBuildings.forEach(b => {
        map.current!.setFeatureState(
          { source: "buildings-source", id: b.building_id },
          { selected: false }
        );
      });
      if (selection.selectedBuildingId) {
        map.current!.setFeatureState(
          { source: "buildings-source", id: selection.selectedBuildingId },
          { selected: true }
        );
      }
    } catch (e) {
      console.warn("Failed to set feature state", e);
    }
  }, [isMapLoaded, selection.selectedBuildingId, filteredBuildings]);

  // ── Camera management ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;

    if (selection.mapMode === "national") {
      map.current.flyTo({ center: [-98.5795, 39.8283], zoom: 3.5, essential: true });
    } else if (selection.mapMode === "building" && selection.selectedBuildingId) {
      const b = filteredBuildings.find(x => x.building_id === selection.selectedBuildingId);
      if (b) map.current.flyTo({ center: [b.lng, b.lat], zoom: 17.5, essential: true });
    } else if (selection.mapMode === "metro" && selection.selectedMetro) {
      const bounds = getBounds(filteredBuildings.filter(b => b.metro === selection.selectedMetro));
      if (bounds) map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    } else if (selection.mapMode === "state" && selection.selectedState) {
      const bounds = getBounds(filteredBuildings.filter(b => b.state === selection.selectedState));
      if (bounds) map.current.fitBounds(bounds, { padding: 50, maxZoom: 8 });
    }
  }, [isMapLoaded, selection.mapMode, selection.selectedMetro, selection.selectedState, selection.selectedBuildingId, filteredBuildings]);

  // ── Tooltip positioning ────────────────────────────────────────────────────
  // Flip to the left when cursor is in the right half of the container to avoid clipping.
  const containerRef = mapContainer;
  const tooltipStyle = tooltip
    ? ((): React.CSSProperties => {
        const containerWidth = containerRef.current?.offsetWidth ?? 800;
        const flipX = tooltip.x > containerWidth * 0.6;
        return {
          position: "absolute",
          left:  flipX ? undefined : tooltip.x + 14,
          right: flipX ? containerWidth - tooltip.x + 14 : undefined,
          top:   Math.max(8, tooltip.y - 90),
          zIndex: 20,
          pointerEvents: "none",
        };
      })()
    : {};

  return (
    <div className="w-full h-full relative bg-slate-100">
      <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} />

      {/* View mode badge */}
      <div className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur-sm border border-gray-700/60 px-3 py-1.5 rounded-md shadow text-xs font-semibold text-gray-300 pointer-events-none z-10 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        <span className="capitalize text-white">
          {selection.mapMode === "national" ? "National View"
            : selection.mapMode === "state" ? "State View"
            : selection.mapMode === "metro" ? "Metro View"
            : "Building View"}
        </span>
      </div>

      {/* Choropleth legend — national view only */}
      {selection.mapMode === "national" && (
        <div className="absolute bottom-8 left-3 z-10 pointer-events-none bg-gray-900/88 backdrop-blur-sm border border-gray-700/60 rounded-xl px-3 py-2.5 shadow-lg">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
            State Opportunity
          </p>
          <div className="space-y-1.5">
            {LEGEND_ITEMS.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/10"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-gray-300 leading-none">
                  {item.label}
                  <span className="text-gray-500 ml-1">{item.range}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {tooltip && (
        <div style={tooltipStyle}>
          <div className="bg-gray-900/96 backdrop-blur-sm border border-gray-700/70 rounded-xl shadow-2xl px-3.5 py-3 text-white min-w-[190px] max-w-[230px]">
            {/* State name + score */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-white leading-tight">{tooltip.stateName}</span>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xl font-bold leading-none text-white">
                  {tooltip.score != null ? Math.round(tooltip.score) : "—"}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${getOpportunityTier(tooltip.score).textClass}`}>
                  {tooltip.tier}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-2" />

            {/* Supporting metrics */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Buildings</span>
                <span className="text-gray-100 font-medium tabular-nums">
                  {tooltip.candidateCount.toLocaleString()}
                </span>
              </div>
              {tooltip.avgSavings != null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Annual Savings</span>
                  <span className="text-gray-100 font-medium tabular-nums">
                    ${Math.round(tooltip.avgSavings).toLocaleString()}
                  </span>
                </div>
              )}
              {tooltip.avgRainfall != null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Rainfall</span>
                  <span className="text-gray-100 font-medium tabular-nums">
                    {tooltip.avgRainfall.toFixed(1)} in/yr
                  </span>
                </div>
              )}
            </div>

            {/* Top drivers */}
            {tooltip.topDrivers.length > 0 && (
              <div className="mt-2.5">
                <div className="flex flex-wrap gap-1">
                  {tooltip.topDrivers.slice(0, 2).map((d, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/40 leading-snug"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* No-data fallback */}
            {tooltip.score == null && (
              <p className="text-[10px] text-gray-500 mt-1.5">Data unavailable for this state.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
