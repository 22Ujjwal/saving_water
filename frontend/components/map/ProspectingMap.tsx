'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, Popup } from 'maplibre-gl'
import { useSelectionStore } from '@/store/selectionStore'
import { loadStateScores, loadBuildings } from '@/lib/data/loaders'
import { filterBuildings } from '@/lib/data/selectors'
import { stateChoroplethExpression, buildingViabilityExpression } from '@/lib/map/colorScales'
import type { StateScore } from '@/types/state'
import type { BuildingCandidate } from '@/types/building'

// US States GeoJSON (simplified — sourced from public domain)
const US_STATES_GEOJSON_URL =
  'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'

const STATE_ABBR: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH',
  'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN',
  Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA',
  'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC',
}

export default function ProspectingMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  const popup = useRef<Popup | null>(null)
  const initialized = useRef(false)

  const {
    selectedStateId,
    selectedMetroId,
    selectedBuildingId,
    mapMode,
    filters,
    setSelectedState,
    setSelectedMetro,
    setSelectedBuilding,
  } = useSelectionStore()

  const stateScores = useRef<StateScore[]>(loadStateScores())
  const buildings = useRef<BuildingCandidate[]>(loadBuildings())

  // ─── helpers ────────────────────────────────────────────────────────────────

  const getStateScore = useCallback((stateName: string): StateScore | undefined => {
    const abbr = STATE_ABBR[stateName]
    return stateScores.current.find((s) => s.state_id === abbr)
  }, [])

  const joinedStatesGeoJSON = useCallback((raw: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection => {
    return {
      ...raw,
      features: raw.features.map((f) => {
        const name = f.properties?.name as string
        const score = getStateScore(name)
        return {
          ...f,
          properties: {
            ...f.properties,
            state_id: score?.state_id ?? null,
            market_readiness_score: score?.market_readiness_score ?? 0,
            top_drivers: score?.top_drivers?.slice(0, 3).join(' · ') ?? 'No data',
          },
        }
      }),
    }
  }, [getStateScore])

  // ─── initialise map once ────────────────────────────────────────────────────

  useEffect(() => {
    if (initialized.current || !mapContainer.current) return
    initialized.current = true

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution: 'Esri, Maxar, Earthstar Geographics',
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#0b1a2e' },
          },
          {
            id: 'satellite',
            type: 'raster',
            source: 'esri-satellite',
            paint: {
              'raster-opacity': 1,
              'raster-fade-duration': 300,
            },
          },
        ],
      },
      center: [-98.5, 39.5],
      zoom: 3.8,
      minZoom: 2,
      maxZoom: 18,
    })

    m.addControl(new maplibregl.NavigationControl(), 'top-right')
    m.addControl(new maplibregl.ScaleControl({ unit: 'imperial' }), 'bottom-right')

    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'rainuse-popup',
      maxWidth: '280px',
    })

    m.on('load', () => {
      // Fetch and add states GeoJSON
      fetch(US_STATES_GEOJSON_URL)
        .then((r) => r.json())
        .then((raw: GeoJSON.FeatureCollection) => {
          const joined = joinedStatesGeoJSON(raw)

          m.addSource('states', { type: 'geojson', data: joined })

          // Choropleth fill — TX, NY, CA only
          m.addLayer({
            id: 'states-fill',
            type: 'fill',
            source: 'states',
            filter: ['in', 'state_id', 'TX', 'NY', 'CA'],
            paint: {
              'fill-color': stateChoroplethExpression() as maplibregl.ExpressionSpecification,
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.7,
                0.5,
              ],
            },
          })

          // Border — all states, subtle white so it reads on satellite
          m.addLayer({
            id: 'states-line',
            type: 'line',
            source: 'states',
            paint: {
              'line-color': 'rgba(255,255,255,0.25)',
              'line-width': 0.7,
            },
          })

          // Selected state highlight ring
          m.addLayer({
            id: 'states-selected',
            type: 'line',
            source: 'states',
            paint: {
              'line-color': '#00c87a',
              'line-width': 2.5,
              'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                1,
                0,
              ],
            },
          })

          // ── hover interactions ───────────────────────────────────────────
          let hoveredId: string | number | null = null

          m.on('mousemove', 'states-fill', (e) => {
            if (!e.features?.length) return
            m.getCanvas().style.cursor = 'pointer'
            const feat = e.features[0]
            if (hoveredId !== null) {
              m.setFeatureState({ source: 'states', id: hoveredId }, { hover: false })
            }
            hoveredId = feat.id ?? null
            if (hoveredId !== null) {
              m.setFeatureState({ source: 'states', id: hoveredId }, { hover: true })
            }
            const props = feat.properties ?? {}
            const score = props.market_readiness_score as number
            popup.current!
              .setLngLat(e.lngLat)
              .setHTML(
                `<div class="rainuse-popup-inner">
                  <div class="popup-state">${props.name ?? ''}</div>
                  <div class="popup-score">Score: <strong>${score > 0 ? score : '—'}</strong>/100</div>
                  <div class="popup-drivers">${props.top_drivers ?? ''}</div>
                </div>`
              )
              .addTo(m)
          })

          m.on('mouseleave', 'states-fill', () => {
            m.getCanvas().style.cursor = ''
            if (hoveredId !== null) {
              m.setFeatureState({ source: 'states', id: hoveredId }, { hover: false })
            }
            hoveredId = null
            popup.current!.remove()
          })

          // ── click ────────────────────────────────────────────────────────
          m.on('click', 'states-fill', (e) => {
            const feat = e.features?.[0]
            if (!feat) return
            const name = feat.properties?.name as string
            const abbr = STATE_ABBR[name]
            if (!abbr) return
            setSelectedState(abbr)

            // Zoom to state immediately — m is live here, no race condition
            const score = stateScores.current.find((s) => s.state_id === abbr)
            if (score?.metros.length) {
              const bounds = score.metros.reduce(
                (acc, metro) => {
                  acc[0] = Math.min(acc[0], metro.lng)
                  acc[1] = Math.min(acc[1], metro.lat)
                  acc[2] = Math.max(acc[2], metro.lng)
                  acc[3] = Math.max(acc[3], metro.lat)
                  return acc
                },
                [Infinity, Infinity, -Infinity, -Infinity]
              )
              m.fitBounds(
                [[bounds[0] - 2, bounds[1] - 1.5], [bounds[2] + 2, bounds[3] + 1.5]],
                { duration: 900, padding: 80 }
              )
            }
          })
        })
        .catch(console.error)

      // ── Metro source (empty until state selected) ─────────────────────
      m.addSource('metros', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      m.addLayer({
        id: 'metros-circle',
        type: 'circle',
        source: 'metros',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 8, 10, 14],
          'circle-color': '#f59e0b',
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(0,0,0,0.6)',
          'circle-opacity': 0.95,
        },
      })
      m.addLayer({
        id: 'metros-label',
        type: 'symbol',
        source: 'metros',
        layout: {
          'text-field': ['get', 'metro_name'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.75)',
          'text-halo-width': 2,
        },
      })

      m.on('mouseenter', 'metros-circle', (e) => {
        m.getCanvas().style.cursor = 'pointer'
        if (!e.features?.length) return
        const p = e.features[0].properties ?? {}
        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="rainuse-popup-inner">
              <div class="popup-state">${p.metro_name ?? ''}</div>
              <div class="popup-score">Metro score: <strong>${p.score}</strong>/100</div>
              <div class="popup-drivers">${(p.top_drivers as string) ?? ''}</div>
            </div>`
          )
          .addTo(m)
      })
      m.on('mouseleave', 'metros-circle', () => {
        m.getCanvas().style.cursor = ''
        popup.current!.remove()
      })
      m.on('click', 'metros-circle', (e) => {
        const feat = e.features?.[0]
        if (!feat) return
        const metroId = feat.properties?.metro_id as string
        setSelectedMetro(metroId)

        const [lng, lat] = (feat.geometry as GeoJSON.Point).coordinates
        m.flyTo({ center: [lng, lat], zoom: 10, duration: 1200 })
      })

      // ── Buildings source ──────────────────────────────────────────────
      m.addSource('buildings', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      m.addLayer({
        id: 'buildings-circle',
        type: 'circle',
        source: 'buildings',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 7, 14, 14],
          'circle-color': buildingViabilityExpression() as maplibregl.ExpressionSpecification,
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            1.5,
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#ffffff',
            'rgba(0,0,0,0.5)',
          ],
          'circle-opacity': 0.9,
        },
      })

      m.on('mouseenter', 'buildings-circle', (e) => {
        m.getCanvas().style.cursor = 'pointer'
        if (!e.features?.length) return
        const p = e.features[0].properties ?? {}
        popup.current!
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="rainuse-popup-inner">
              <div class="popup-state">${p.address ?? ''}</div>
              <div class="popup-score">Viability: <strong>${p.viability_score}</strong>/100</div>
              <div class="popup-drivers">${p.building_type ?? ''} · ${p.roof_area_sqft ? Math.round(p.roof_area_sqft / 1000) + 'K sqft' : ''}</div>
            </div>`
          )
          .addTo(m)
      })
      m.on('mouseleave', 'buildings-circle', () => {
        m.getCanvas().style.cursor = ''
        popup.current!.remove()
      })
      m.on('click', 'buildings-circle', (e) => {
        const feat = e.features?.[0]
        if (!feat) return
        setSelectedBuilding(feat.properties?.building_id as string)
      })
    })

    map.current = m
    return () => {
      m.remove()
      map.current = null
      initialized.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── React to mapMode — satellite always on, fade choropleth as user drills in
  useEffect(() => {
    const m = map.current
    if (!m || !m.isStyleLoaded() || !m.getLayer('states-fill')) return

    const overlayOpacity = (hover: number, normal: number) => [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      hover,
      normal,
    ] as maplibregl.ExpressionSpecification

    if (mapMode === 'national') {
      m.setPaintProperty('states-fill', 'fill-opacity', overlayOpacity(0.7, 0.5))
    } else {
      // state / metro / building — hide choropleth, show pure satellite
      m.setPaintProperty('states-fill', 'fill-opacity', 0)
    }
  }, [mapMode])

  // ─── React to state selection ───────────────────────────────────────────────
  useEffect(() => {
    const m = map.current
    if (!m || !m.isStyleLoaded()) return

    if (selectedStateId) {
      const score = stateScores.current.find((s) => s.state_id === selectedStateId)
      if (!score) return

      // Update metros source
      const metroFeatures: GeoJSON.Feature[] = score.metros.map((metro) => ({
        type: 'Feature',
        properties: {
          metro_id: metro.metro_id,
          metro_name: metro.metro_name,
          score: metro.score,
          top_drivers: metro.top_drivers.slice(0, 2).join(' · '),
        },
        geometry: {
          type: 'Point',
          coordinates: [metro.lng, metro.lat],
        },
      }))
      ;(m.getSource('metros') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: metroFeatures,
      })

    } else {
      // Clear metros + buildings
      ;(m.getSource('metros') as maplibregl.GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: [],
      })
      ;(m.getSource('buildings') as maplibregl.GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: [],
      })
      m.flyTo({ center: [-98.5, 39.5], zoom: 3.8, duration: 1000 })
    }
  }, [selectedStateId])

  // ─── React to metro selection + filters ────────────────────────────────────
  useEffect(() => {
    const m = map.current
    if (!m || !m.isStyleLoaded()) return
    if (!selectedMetroId) return

    const filtered = filterBuildings(buildings.current, selectedMetroId, filters)
    const features: GeoJSON.Feature[] = filtered.map((b) => ({
      type: 'Feature',
      id: b.building_id,
      properties: {
        building_id: b.building_id,
        address: b.address,
        building_type: b.building_type,
        viability_score: b.viability_score,
        cv_confidence_score: b.cv_confidence_score,
        roof_area_sqft: b.roof_area_sqft,
        cooling_tower_present: b.cooling_tower_present,
      },
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
    }))

    ;(m.getSource('buildings') as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features,
    })
  }, [selectedMetroId, filters])

  // ─── React to building selection — evidence overlay ──────────────────────
  useEffect(() => {
    const m = map.current
    if (!m || !m.isStyleLoaded()) return

    // Remove previous evidence layers
    ;['building-imagery', 'building-roof-fill', 'building-roof-outline', 'building-towers'].forEach((id) => {
      if (m.getLayer(id)) m.removeLayer(id)
    })
    ;['building-imagery-src', 'building-roof-src', 'building-towers-src'].forEach((id) => {
      if (m.getSource(id)) m.removeSource(id)
    })

    if (!selectedBuildingId) return

    const building = buildings.current.find((b) => b.building_id === selectedBuildingId)
    if (!building) return

    // Zoom to building
    m.flyTo({ center: [building.lng, building.lat], zoom: 15, duration: 1000 })

    // Imagery raster layer
    m.addSource('building-imagery-src', {
      type: 'image',
      url: building.imagery_url,
      coordinates: building.imagery_bounds as [[number, number], [number, number], [number, number], [number, number]],
    })
    m.addLayer({
      id: 'building-imagery',
      type: 'raster',
      source: 'building-imagery-src',
      paint: { 'raster-opacity': 0.7, 'raster-fade-duration': 300 },
    }, 'buildings-circle')

    // Roof polygon
    const roofGeom = building.roof_geometry as GeoJSON.Feature
    m.addSource('building-roof-src', { type: 'geojson', data: roofGeom })
    m.addLayer({
      id: 'building-roof-fill',
      type: 'fill',
      source: 'building-roof-src',
      paint: { 'fill-color': '#00c87a', 'fill-opacity': 0.25 },
    })
    m.addLayer({
      id: 'building-roof-outline',
      type: 'line',
      source: 'building-roof-src',
      paint: { 'line-color': '#00c87a', 'line-width': 2 },
    })

    // Cooling tower markers
    if (building.cooling_tower_present && building.cooling_tower_geometry) {
      const towerGeom = building.cooling_tower_geometry as GeoJSON.FeatureCollection
      m.addSource('building-towers-src', { type: 'geojson', data: towerGeom })
      m.addLayer({
        id: 'building-towers',
        type: 'circle',
        source: 'building-towers-src',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f59e0b',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#1a1f2e',
        },
      })
    }
  }, [selectedBuildingId])

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />
      <style>{`
        .rainuse-popup .maplibregl-popup-content {
          background: #1a1f2e;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 0;
          color: #f1f5f9;
          font-family: ui-sans-serif, system-ui, sans-serif;
          box-shadow: 0 4px 24px #00000066;
        }
        .rainuse-popup .maplibregl-popup-tip {
          border-top-color: #1a1f2e !important;
          border-bottom-color: #1a1f2e !important;
        }
        .rainuse-popup-inner {
          padding: 10px 12px;
        }
        .popup-state {
          font-size: 13px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        .popup-score {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .popup-score strong {
          color: #00c87a;
        }
        .popup-drivers {
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
        }
        .maplibregl-ctrl-attrib {
          font-size: 9px !important;
        }
      `}</style>
    </>
  )
}
