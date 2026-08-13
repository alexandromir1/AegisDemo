export type IncidentStatus =
  | 'detected'
  | 'investigating'
  | 'verified'
  | 'contained'
  | 'resolved'
  | 'false_positive'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type EvidenceType = 'satellite' | 'vision' | 'thermal' | 'weather' | 'gis'

export type EvidenceStatus =
  | 'confirmed'
  | 'likely'
  | 'supporting'
  | 'negative'
  | 'forest'
  | 'non_forest'

export interface EvidenceObservation {
  id: string
  timestamp: string
  source: EvidenceType
  type: string
  status: EvidenceStatus
  confidence: number
  description: string
  providerLabel: string
  metadata?: Record<string, unknown>
}

export interface EvidenceSource {
  type: EvidenceType
  label: string
  status: EvidenceStatus
  confidence: number
  description: string
  providerLabel?: string
  observationCount?: number
  latestAt?: string
}

export interface TimelineEvent {
  id: string
  timestamp: string
  source: string
  title: string
  description: string
  confidence?: number
  observationId?: string
}

export interface WeatherSnapshot {
  temperatureC: number
  humidityPercent: number
  windSpeedKmh: number
  windDirection: string
  precipitationMm: number
  vegetationDryness: 'low' | 'moderate' | 'high' | 'extreme'
  interpretation: string
}

export interface NearbyAsset {
  id: string
  name: string
  type: 'forest' | 'road' | 'facility' | 'settlement'
  distanceKm: number
  latitude: number
  longitude: number
}

export interface ImpactAssessment {
  fireSpreadRisk: 'low' | 'medium' | 'high' | 'critical'
  nearbyForestAssets: number
  infrastructureExposure: 'low' | 'medium' | 'high'
  populationExposure: 'low' | 'medium' | 'high'
  estimatedDirection: string
  nearbyAssets: NearbyAsset[]
}

export interface FirePerimeter {
  timeOffsetMinutes: number
  label: string
  coordinates: [number, number][]
  areaHa: number
}

export interface AegisAssessment {
  priorityLabel: string
  summary: string
  recommendedActions: string[]
}

export interface ExplainabilityItem {
  id: string
  text: string
  positive: boolean
}

export interface FireEvent {
  id: string
  name: string
  locationLabel: string
  sector: string
  latitude: number
  longitude: number
  status: IncidentStatus
  priority: Priority
  confidence: number
  detectedAt: string
  affectedAreaHa: number
  growthPercent: number | null
  subtitle: string
  reasoning: string
  observations: EvidenceObservation[]
  sources: EvidenceSource[]
  timeline: TimelineEvent[]
  weather: WeatherSnapshot
  impact: ImpactAssessment
  assessment: AegisAssessment
  explainability: ExplainabilityItem[]
  perimeters: FirePerimeter[]
  isFalsePositive?: boolean
  isHistorical?: boolean
}

export interface Territory {
  id: string
  name: string
  areaHa: number
  coordinates: [number, number][]
  center: [number, number]
}

export interface DataSourceInfo {
  id: string
  category: string
  name: string
  status: 'simulated' | 'demo' | 'live'
  provider: string
}

export interface HistoryStats {
  firesDetected: number
  verifiedFires: number
  averageConfidence: number
  averageLatencyMin: number
  totalAffectedHa: number
}

export interface HistorySeriesPoint {
  date: string
  count: number
  severity: number
}

export interface SeverityBucket {
  severity: string
  count: number
}

export interface ConfidenceBucket {
  range: string
  count: number
}

export interface ReplayFrame {
  id: string
  offsetMinutes: number
  label: string
  title: string
  description: string
  showMarker: boolean
  perimeterIndex: number | null
  confidence?: number
}

export interface OverviewKpis {
  activeIncidents: number
  highPriority: number
  monitoredAreaHa: number
  verifiedToday: number
  averageConfidence: number
  lastUpdated: string
}

export type MapLayerId =
  | 'fireEvents'
  | 'monitoredTerritory'
  | 'satellite'
  | 'weather'
  | 'wind'
  | 'vegetation'
  | 'firePerimeter'
  | 'infrastructure'

export interface MapLayerState {
  id: MapLayerId
  label: string
  enabled: boolean
}
