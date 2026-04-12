"use client";
import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SelectionState } from "../dashboard/ProspectingDashboard";
import { BuildingCandidate } from "@/types/building";
import { StateScore } from "@/types/state";
import { FeatureCollection } from "geojson";

type MainMapProps = {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
  filteredBuildings: BuildingCandidate[];
  stateScores: StateScore[];
  statesGeo: FeatureCollection | null;
};

const SCORE_BUCKETS = [
  [85, "#166534"],
  [70, "#22c55e"],
  [50, "#86efac"],
  [0,  "#dcfce3"],
] as const;

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

      // ── Sources (order doesn't matter for sources) ───────────────────────

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

      // ── Layers — bottom to top ──────────────────────────────────────────

      // 1. Satellite basemap — always on as the permanent base
      map.current!.addLayer({
        id: "satellite-layer",
        type: "raster",
        source: "satellite-source",
        layout: { visibility: "visible" },
      });

      // 2. State choropleth fill — shown at national + state only
      map.current!.addLayer({
        id: "states-fill",
        type: "fill",
        source: "states-source",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.9,
            0.6,
          ],
        },
      });

      // 3. State choropleth outline
      map.current!.addLayer({
        id: "states-line",
        type: "line",
        source: "states-source",
        paint: { "line-color": "#ffffff", "line-width": 1 },
      });

      // 4. Roof polygon fill — shown at building level only
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

      // 7. Cooling tower circles — shown at building level only
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

      // ── Events ────────────────────────────────────────────────────────────

      let hoveredStateId: string | null = null;

      map.current!.on("mousemove", "states-fill", (e) => {
        if (!e.features?.length) return;
        map.current!.getCanvas().style.cursor = "pointer";
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
  useEffect(() => {
    if (!isMapLoaded || !map.current || !statesGeo || stateScores.length === 0) return;

    const enrichedFeatures = statesGeo.features.map((feature, idx) => {
      const stateCode = feature.properties?.postal || feature.properties?.name;
      const scoreData = stateScores.find(
        s => s.state_code === stateCode || s.state === stateCode
      );

      let color = "#e2e8f0";
      if (scoreData) {
        const score = scoreData.market_readiness_score;
        const bucket = SCORE_BUCKETS.find(b => score >= b[0]);
        if (bucket) color = bucket[1];
      }

      return {
        ...feature,
        id: feature.id || idx,
        properties: {
          ...feature.properties,
          stateCode: scoreData?.state_code || stateCode,
          score: scoreData?.market_readiness_score || null,
          color,
        },
      };
    });

    const source = map.current.getSource("states-source") as maplibregl.GeoJSONSource;
    source?.setData({ type: "FeatureCollection", features: enrichedFeatures });
  }, [isMapLoaded, statesGeo, stateScores]);

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

    // Choropleth only at national level; satellite is always visible
    const showChoropleth = selection.mapMode === "national";
    const showOverlays   = selection.mapMode === "building";

    const setVis = (id: string, visible: boolean) => {
      if (map.current!.getLayer(id)) {
        map.current!.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      }
    };

    setVis("states-fill",          showChoropleth);
    setVis("states-line",          showChoropleth);
    // satellite-layer is intentionally omitted — it stays visible at all times
    setVis("roof-fill",            showOverlays);
    setVis("roof-outline",         showOverlays);
    setVis("cooling-towers-circle",showOverlays);
  }, [isMapLoaded, selection.mapMode]);

  // ── Update roof + cooling tower overlays when building changes ─────────────
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

    // Roof polygon
    if (roofSrc && building.roof_geometry) {
      roofSrc.setData({
        type: "Feature",
        geometry: building.roof_geometry,
        properties: {},
      });
    }

    // Cooling tower scatter points
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
      if (b) {
        map.current.flyTo({ center: [b.lng, b.lat], zoom: 17.5, essential: true });
      }
    } else if (selection.mapMode === "metro" && selection.selectedMetro) {
      const bounds = getBounds(filteredBuildings.filter(b => b.metro === selection.selectedMetro));
      if (bounds) map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    } else if (selection.mapMode === "state" && selection.selectedState) {
      const bounds = getBounds(filteredBuildings.filter(b => b.state === selection.selectedState));
      if (bounds) map.current.fitBounds(bounds, { padding: 50, maxZoom: 8 });
    }
  }, [isMapLoaded, selection.mapMode, selection.selectedMetro, selection.selectedState, selection.selectedBuildingId, filteredBuildings]);

  return (
    <div className="w-full h-full relative bg-slate-100">
      <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} />
      <div className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur-sm border border-gray-700/60 px-3 py-1.5 rounded-md shadow text-xs font-semibold text-gray-300 pointer-events-none z-10 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        <span className="capitalize text-white">{selection.mapMode === "national" ? "National View" : selection.mapMode === "state" ? `State View` : selection.mapMode === "metro" ? "Metro View" : "Building View"}</span>
      </div>
    </div>
  );
}
