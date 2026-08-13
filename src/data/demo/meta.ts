import type {
  DataSourceInfo,
  HistorySeriesPoint,
  SeverityBucket,
  ConfidenceBucket,
  HistoryStats,
  OverviewKpis,
} from '../../types'
import { allMonitoredAreaHa } from './territories'

export const overviewKpis: OverviewKpis = {
  activeIncidents: 7,
  highPriority: 2,
  monitoredAreaHa: allMonitoredAreaHa,
  verifiedToday: 5,
  averageConfidence: 91,
  lastUpdated: '2026-02-14T15:42:00Z',
}

export const dataSources: DataSourceInfo[] = [
  {
    id: 'viirs',
    category: 'SATELLITE',
    name: 'VIIRS',
    status: 'simulated',
    provider: 'DemoSatelliteProvider',
  },
  {
    id: 'sentinel',
    category: 'SATELLITE',
    name: 'Sentinel',
    status: 'simulated',
    provider: 'DemoSatelliteProvider',
  },
  {
    id: 'weather',
    category: 'WEATHER',
    name: 'Weather data',
    status: 'simulated',
    provider: 'DemoWeatherProvider',
  },
  {
    id: 'yolo',
    category: 'VISION',
    name: 'YOLO wildfire model',
    status: 'demo',
    provider: 'DemoVisionProvider',
  },
  {
    id: 'gis',
    category: 'GIS',
    name: 'Land cover / terrain',
    status: 'simulated',
    provider: 'DemoGisProvider',
  },
]

export const historyStats: HistoryStats = {
  firesDetected: 42,
  verifiedFires: 37,
  averageConfidence: 91,
  averageLatencyMin: 18,
  totalAffectedHa: 1842,
}

export const activityOverTime: HistorySeriesPoint[] = [
  { date: 'Jan', count: 3, severity: 1.2 },
  { date: 'Feb', count: 5, severity: 2.1 },
  { date: 'Mar', count: 8, severity: 3.4 },
  { date: 'Apr', count: 4, severity: 1.8 },
  { date: 'May', count: 2, severity: 0.9 },
  { date: 'Jun', count: 1, severity: 0.4 },
  { date: 'Jul', count: 1, severity: 0.3 },
  { date: 'Aug', count: 2, severity: 0.7 },
  { date: 'Sep', count: 3, severity: 1.1 },
  { date: 'Oct', count: 6, severity: 2.4 },
  { date: 'Nov', count: 9, severity: 3.8 },
  { date: 'Dec', count: 7, severity: 3.1 },
]

export const severityDistribution: SeverityBucket[] = [
  { severity: 'Low', count: 14 },
  { severity: 'Medium', count: 12 },
  { severity: 'High', count: 9 },
  { severity: 'Critical', count: 7 },
]

export const confidenceDistribution: ConfidenceBucket[] = [
  { range: '0–40%', count: 3 },
  { range: '40–60%', count: 5 },
  { range: '60–80%', count: 11 },
  { range: '80–90%', count: 13 },
  { range: '90–100%', count: 10 },
]
