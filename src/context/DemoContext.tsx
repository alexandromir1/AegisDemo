import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { FireEvent, IncidentStatus, MapLayerId, MapLayerState } from '../types'
import { providers } from '../providers'
import { overviewKpis } from '../data/demo/meta'
import { territories } from '../data/demo/territories'

const defaultLayers: MapLayerState[] = [
  { id: 'fireEvents', label: 'Fire events', enabled: true },
  { id: 'monitoredTerritory', label: 'Monitored territory', enabled: true },
  { id: 'satellite', label: 'Satellite imagery', enabled: false },
  { id: 'weather', label: 'Weather', enabled: false },
  { id: 'wind', label: 'Wind', enabled: false },
  { id: 'vegetation', label: 'Vegetation', enabled: false },
  { id: 'firePerimeter', label: 'Fire perimeter', enabled: true },
  { id: 'infrastructure', label: 'Infrastructure', enabled: false },
]

interface DemoContextValue {
  demoMode: boolean
  setDemoMode: (v: boolean) => void
  incidents: FireEvent[]
  setIncidentStatus: (id: string, status: IncidentStatus) => void
  resetDemo: () => void
  selectedTerritoryId: string | 'all'
  setSelectedTerritoryId: (id: string | 'all') => void
  layers: MapLayerState[]
  toggleLayer: (id: MapLayerId) => void
  mapStyle: 'satellite' | 'terrain' | 'dark'
  setMapStyle: (s: 'satellite' | 'terrain' | 'dark') => void
  kpis: typeof overviewKpis
  territories: typeof territories
  tourOpen: boolean
  setTourOpen: (v: boolean) => void
  tourStep: number
  setTourStep: (n: number) => void
  lastUpdated: string
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(true)
  const [version, setVersion] = useState(0)
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | 'all'>(
    'all',
  )
  const [layers, setLayers] = useState(defaultLayers)
  const [mapStyle, setMapStyle] = useState<'satellite' | 'terrain' | 'dark'>(
    'satellite',
  )
  const [tourOpen, setTourOpen] = useState(false)
  const [tourStep, setTourStep] = useState(0)

  const incidents = useMemo(() => {
    void version
    return providers.incidents.listIncidents()
  }, [version])

  const setIncidentStatus = useCallback((id: string, status: IncidentStatus) => {
    const incident = providers.incidents.getIncident(id)
    if (!incident) return

    const now = new Date().toISOString()
    const statusLabels: Record<IncidentStatus, string> = {
      detected: 'Status set to Detected',
      investigating: 'Status set to Investigating',
      verified: 'Status set to Verified',
      contained: 'Status set to Contained',
      resolved: 'Status set to Resolved',
      false_positive: 'Status set to False Positive',
    }

    providers.incidents.updateIncident(id, {
      status,
      timeline: [
        ...incident.timeline,
        {
          id: `status-${Date.now()}`,
          timestamp: now,
          source: 'Operator',
          title: statusLabels[status],
          description: 'Manual status update in demo environment.',
        },
      ],
    })
    setVersion((v) => v + 1)
  }, [])

  const resetDemo = useCallback(() => {
    providers.incidents.reset()
    setLayers(defaultLayers)
    setSelectedTerritoryId('all')
    setMapStyle('satellite')
    setTourOpen(false)
    setTourStep(0)
    setVersion((v) => v + 1)
  }, [])

  const toggleLayer = useCallback((id: MapLayerId) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)),
    )
  }, [])

  const value: DemoContextValue = {
    demoMode,
    setDemoMode,
    incidents,
    setIncidentStatus,
    resetDemo,
    selectedTerritoryId,
    setSelectedTerritoryId,
    layers,
    toggleLayer,
    mapStyle,
    setMapStyle,
    kpis: overviewKpis,
    territories,
    tourOpen,
    setTourOpen,
    tourStep,
    setTourStep,
    lastUpdated: overviewKpis.lastUpdated,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
