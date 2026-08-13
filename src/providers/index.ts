import type {
  FireEvent,
  WeatherSnapshot,
  EvidenceSource,
  EvidenceObservation,
  DataSourceInfo,
} from '../types'
import { cloneIncidents, getIncidentById } from '../data/demo/incidents'
import { dataSources } from '../data/demo/meta'
import { deriveSources } from '../engine/evidenceEngine'

/**
 * Provider layer sits under the Evidence Engine.
 * Demo providers return simulated observations; future providers
 * (FIRMS, Sentinel, YOLOv5, weather APIs) can replace these without UI changes.
 */

export interface SatelliteProvider {
  readonly name: string
  getObservations(incidentId: string): EvidenceObservation[]
  getThermalEvidence(incidentId: string): EvidenceSource | null
  getSatelliteEvidence(incidentId: string): EvidenceSource | null
}

export interface VisionProvider {
  readonly name: string
  getObservations(incidentId: string): EvidenceObservation[]
  getVisionEvidence(incidentId: string): EvidenceSource | null
}

export interface WeatherProvider {
  readonly name: string
  getWeather(incidentId: string): WeatherSnapshot | null
  getObservations(incidentId: string): EvidenceObservation[]
}

export interface GisProvider {
  readonly name: string
  getObservations(incidentId: string): EvidenceObservation[]
  getLandCoverEvidence(incidentId: string): EvidenceSource | null
}

export interface IncidentProvider {
  readonly name: string
  listIncidents(): FireEvent[]
  getIncident(id: string): FireEvent | undefined
  getDataSources(): DataSourceInfo[]
}

function obsFor(incidentId: string, source: EvidenceObservation['source']) {
  return (
    getIncidentById(incidentId)?.observations.filter((o) => o.source === source) ??
    []
  )
}

export class DemoSatelliteProvider implements SatelliteProvider {
  readonly name = 'DemoSatelliteProvider'

  getObservations(incidentId: string): EvidenceObservation[] {
    return [
      ...obsFor(incidentId, 'satellite'),
      ...obsFor(incidentId, 'thermal'),
    ]
  }

  getThermalEvidence(incidentId: string): EvidenceSource | null {
    return (
      deriveSources(obsFor(incidentId, 'thermal')).find(
        (s) => s.type === 'thermal',
      ) ?? null
    )
  }

  getSatelliteEvidence(incidentId: string): EvidenceSource | null {
    return (
      deriveSources(obsFor(incidentId, 'satellite')).find(
        (s) => s.type === 'satellite',
      ) ?? null
    )
  }
}

export class DemoVisionProvider implements VisionProvider {
  readonly name = 'DemoVisionProvider'

  getObservations(incidentId: string): EvidenceObservation[] {
    return obsFor(incidentId, 'vision')
  }

  getVisionEvidence(incidentId: string): EvidenceSource | null {
    return (
      deriveSources(obsFor(incidentId, 'vision')).find(
        (s) => s.type === 'vision',
      ) ?? null
    )
  }
}

export class DemoWeatherProvider implements WeatherProvider {
  readonly name = 'DemoWeatherProvider'

  getWeather(incidentId: string): WeatherSnapshot | null {
    return getIncidentById(incidentId)?.weather ?? null
  }

  getObservations(incidentId: string): EvidenceObservation[] {
    return obsFor(incidentId, 'weather')
  }
}

export class DemoGisProvider implements GisProvider {
  readonly name = 'DemoGisProvider'

  getObservations(incidentId: string): EvidenceObservation[] {
    return obsFor(incidentId, 'gis')
  }

  getLandCoverEvidence(incidentId: string): EvidenceSource | null {
    return (
      deriveSources(obsFor(incidentId, 'gis')).find((s) => s.type === 'gis') ??
      null
    )
  }
}

export class DemoIncidentProvider implements IncidentProvider {
  readonly name = 'DemoIncidentProvider'
  private cache: FireEvent[]

  constructor() {
    this.cache = cloneIncidents()
  }

  listIncidents(): FireEvent[] {
    return this.cache
  }

  getIncident(id: string): FireEvent | undefined {
    return this.cache.find((i) => i.id === id)
  }

  updateIncident(id: string, patch: Partial<FireEvent>): FireEvent | undefined {
    const idx = this.cache.findIndex((i) => i.id === id)
    if (idx < 0) return undefined
    this.cache[idx] = { ...this.cache[idx], ...patch }
    return this.cache[idx]
  }

  reset(): void {
    this.cache = cloneIncidents()
  }

  getDataSources(): DataSourceInfo[] {
    return dataSources
  }
}

/** Future swap targets (stubs for architecture clarity). */
export class FIRMSProvider implements SatelliteProvider {
  readonly name = 'FIRMSProvider'
  getObservations(): EvidenceObservation[] {
    throw new Error('Not implemented — replace DemoSatelliteProvider')
  }
  getThermalEvidence(): EvidenceSource | null {
    throw new Error('Not implemented — replace DemoSatelliteProvider')
  }
  getSatelliteEvidence(): EvidenceSource | null {
    throw new Error('Not implemented — replace DemoSatelliteProvider')
  }
}

export class YOLOv5Provider implements VisionProvider {
  readonly name = 'YOLOv5Provider'
  getObservations(): EvidenceObservation[] {
    throw new Error('Not implemented — replace DemoVisionProvider')
  }
  getVisionEvidence(): EvidenceSource | null {
    throw new Error('Not implemented — replace DemoVisionProvider')
  }
}

export const providers = {
  satellite: new DemoSatelliteProvider(),
  vision: new DemoVisionProvider(),
  weather: new DemoWeatherProvider(),
  gis: new DemoGisProvider(),
  incidents: new DemoIncidentProvider(),
}
