import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Tooltip,
  Polyline,
  Marker,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { FireEvent, FirePerimeter, MapLayerId, NearbyAsset } from '../../types'
import { useDemo } from '../../context/DemoContext'
import { formatUtc, growthLabel, territoryLabelKey } from '../../utils/format'
import { demoMapCenter, demoMapZoom } from '../../data/demo/territories'
import { useT } from '../../i18n/LocaleContext'
import type { TranslationKey } from '../../i18n/en'

const tileUrls = {
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

const layerLabelKeys: Record<MapLayerId, TranslationKey> = {
  fireEvents: 'map.layer.fireEvents',
  monitoredTerritory: 'map.layer.monitoredTerritory',
  satellite: 'map.layer.satellite',
  weather: 'map.layer.weather',
  wind: 'map.layer.wind',
  vegetation: 'map.layer.vegetation',
  firePerimeter: 'map.layer.firePerimeter',
  infrastructure: 'map.layer.infrastructure',
}

function MapInvalidator({ styleKey }: { styleKey: string }) {
  const map = useMap()
  useEffect(() => {
    const timers = [0, 50, 150, 400].map((ms) =>
      window.setTimeout(() => map.invalidateSize(), ms),
    )
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      window.removeEventListener('resize', onResize)
    }
  }, [map, styleKey])
  return null
}

function FocusOn({
  lat,
  lng,
  zoom,
}: {
  lat?: number
  lng?: number
  zoom?: number
}) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], zoom ?? Math.max(map.getZoom(), 11), {
        animate: true,
      })
    }
  }, [lat, lng, zoom, map])
  return null
}

interface AegisMapProps {
  incidents?: FireEvent[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  focusIncident?: FireEvent | null
  perimeters?: FirePerimeter[]
  activePerimeterIndex?: number
  nearbyAssets?: NearbyAsset[]
  showWind?: boolean
  className?: string
  compact?: boolean
  replayMarker?: { lat: number; lng: number; show: boolean } | null
}

export function AegisMap({
  incidents = [],
  selectedId,
  onSelect,
  focusIncident,
  perimeters = [],
  activePerimeterIndex = -1,
  nearbyAssets = [],
  showWind = false,
  className,
  compact = false,
  replayMarker,
}: AegisMapProps) {
  const t = useT()
  const { layers, mapStyle, setMapStyle, territories, selectedTerritoryId, toggleLayer } =
    useDemo()

  const layerOn = useMemo(() => {
    const map = Object.fromEntries(layers.map((l) => [l.id, l.enabled]))
    return map as Record<string, boolean>
  }, [layers])

  const visibleTerritories =
    selectedTerritoryId === 'all'
      ? territories
      : territories.filter((territory) => territory.id === selectedTerritoryId)

  const visibleIncidents =
    selectedTerritoryId === 'all'
      ? incidents
      : incidents.filter((i) => i.sector === selectedTerritoryId)

  return (
    <div className={`map-stage ${className ?? ''}`}>
      {!compact && (
        <>
          <div className="map-style-switch">
            {(['satellite', 'terrain', 'dark'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={mapStyle === s ? 'active' : ''}
                onClick={() => setMapStyle(s)}
              >
                {t(`map.style.${s}`)}
              </button>
            ))}
          </div>

          <div className="layer-control">
            <h4>{t('map.layers')}</h4>
            {layers.map((layer) => (
              <label key={layer.id} className="layer-item">
                <input
                  type="checkbox"
                  checked={layer.enabled}
                  onChange={() => toggleLayer(layer.id)}
                />
                {t(layerLabelKeys[layer.id])}
              </label>
            ))}
          </div>
        </>
      )}

      <MapContainer
        center={demoMapCenter}
        zoom={compact ? 11 : demoMapZoom}
        zoomControl={!compact}
        scrollWheelZoom
        attributionControl={false}
      >
        <MapInvalidator styleKey={`${mapStyle}-${className ?? 'default'}-${compact}`} />
        <TileLayer key={mapStyle} url={tileUrls[mapStyle]} attribution="" />

        {focusIncident && (
          <FocusOn
            lat={focusIncident.latitude}
            lng={focusIncident.longitude}
            zoom={11}
          />
        )}

        {layerOn.satellite &&
          visibleTerritories.map((territory) => (
            <Polygon
              key={`sat-${territory.id}`}
              positions={territory.coordinates}
              pathOptions={{
                color: '#f4d35e',
                weight: 1,
                fillColor: '#c44900',
                fillOpacity: 0.14,
                dashArray: '2 6',
              }}
            >
              <Tooltip sticky>{t('map.satCoverage')}</Tooltip>
            </Polygon>
          ))}

        {layerOn.monitoredTerritory &&
          visibleTerritories.map((territory) => {
            const key = territoryLabelKey(territory.id)
            return (
              <Polygon
                key={territory.id}
                positions={territory.coordinates}
                pathOptions={{
                  color: '#e8a54b',
                  weight: 1.5,
                  fillColor: '#e8a54b',
                  fillOpacity: 0.06,
                  dashArray: '6 4',
                }}
              >
                <Tooltip sticky>{key ? t(key) : territory.name}</Tooltip>
              </Polygon>
            )
          })}

        {layerOn.vegetation &&
          visibleTerritories.map((territory) => (
            <Polygon
              key={`veg-${territory.id}`}
              positions={territory.coordinates}
              pathOptions={{
                color: '#3d6b4f',
                weight: 0,
                fillColor: '#2d5a3f',
                fillOpacity: 0.18,
              }}
            />
          ))}

        {layerOn.weather &&
          visibleTerritories.map((territory) => (
            <CircleMarker
              key={`wx-${territory.id}`}
              center={territory.center}
              radius={40}
              pathOptions={{
                color: '#5b8def',
                fillColor: '#5b8def',
                fillOpacity: 0.12,
                weight: 1,
              }}
            >
              <Tooltip>{t('map.weatherField')}</Tooltip>
            </CircleMarker>
          ))}

        {(layerOn.wind || showWind) &&
          incidents.slice(0, 4).map((inc) => {
            const len = 0.08
            const dir = inc.weather.windDirection
            const angles: Record<string, number> = {
              N: -90,
              NE: -45,
              E: 0,
              SE: 45,
              S: 90,
              SW: 135,
              W: 180,
              NW: -135,
            }
            const rad = ((angles[dir] ?? -45) * Math.PI) / 180
            const end: [number, number] = [
              inc.latitude + Math.sin(rad) * len * 0.7,
              inc.longitude + Math.cos(rad) * len,
            ]
            return (
              <Polyline
                key={`wind-${inc.id}`}
                positions={[[inc.latitude, inc.longitude], end]}
                pathOptions={{ color: '#8ecae6', weight: 2, dashArray: '4 3' }}
              >
                <Tooltip>
                  {t('map.wind')} {inc.weather.windSpeedKmh} km/h {dir}
                </Tooltip>
              </Polyline>
            )
          })}

        {layerOn.firePerimeter &&
          perimeters.map((p, idx) => {
            if (activePerimeterIndex >= 0 && idx > activePerimeterIndex) return null
            const opacity =
              activePerimeterIndex >= 0
                ? idx === activePerimeterIndex
                  ? 0.35
                  : 0.12
                : 0.15 + idx * 0.05
            return (
              <Polygon
                key={`perim-${p.label}`}
                positions={p.coordinates}
                pathOptions={{
                  color: '#d4543a',
                  weight: idx === activePerimeterIndex || activePerimeterIndex < 0 ? 2 : 1,
                  fillColor: '#d4543a',
                  fillOpacity: opacity,
                }}
              >
                <Tooltip>
                  {p.label} · {p.areaHa.toFixed(1)} ha
                </Tooltip>
              </Polygon>
            )
          })}

        {layerOn.infrastructure &&
          nearbyAssets.map((a) => (
            <CircleMarker
              key={a.id}
              center={[a.latitude, a.longitude]}
              radius={6}
              pathOptions={{
                color: '#c9d1d9',
                fillColor: '#8b9aab',
                fillOpacity: 0.9,
                weight: 1,
              }}
            >
              <Tooltip>
                {a.name} · {a.distanceKm} km
              </Tooltip>
            </CircleMarker>
          ))}

        {layerOn.fireEvents &&
          visibleIncidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.latitude, inc.longitude]}
              icon={L.divIcon({
                className: '',
                html: `<div class="incident-marker ${inc.priority}"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
              })}
              eventHandlers={{
                click: () => onSelect?.(inc.id),
              }}
              opacity={selectedId && selectedId !== inc.id ? 0.55 : 1}
            >
              <Tooltip className="aegis-tooltip" direction="top" offset={[0, -8]}>
                <div className="tooltip-id">INCIDENT #{inc.id}</div>
                <div className="tooltip-row">
                  <span>Status</span>
                  <span>{inc.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="tooltip-row">
                  <span>Confidence</span>
                  <span>{inc.confidence}%</span>
                </div>
                <div className="tooltip-row">
                  <span>Detected</span>
                  <span>{formatUtc(inc.detectedAt)}</span>
                </div>
                <div className="tooltip-row">
                  <span>Growth</span>
                  <span>
                    {growthLabel(inc.growthPercent)}
                    {inc.growthPercent != null ? ' / 2h' : ''}
                  </span>
                </div>
                <div className="tooltip-row">
                  <span>Priority</span>
                  <span>{inc.priority.toUpperCase()}</span>
                </div>
              </Tooltip>
            </Marker>
          ))}

        {replayMarker?.show && (
          <CircleMarker
            center={[replayMarker.lat, replayMarker.lng]}
            radius={10}
            pathOptions={{
              color: '#e8a54b',
              fillColor: '#d4543a',
              fillOpacity: 0.7,
              weight: 2,
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
