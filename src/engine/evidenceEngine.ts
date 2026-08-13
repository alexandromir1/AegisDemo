import type {
  EvidenceObservation,
  EvidenceSource,
  EvidenceStatus,
  EvidenceType,
  IncidentStatus,
  Priority,
  TimelineEvent,
} from '../types'

/**
 * Demo scoring model — not production wildfire probability.
 *
 * Deterministic UX simulation of how AEGIS will eventually fuse
 * independent provider signals. Not calibrated, not scientifically
 * validated, and not a real fire probability estimate.
 */

const STATUS_WEIGHT: Record<EvidenceStatus, number> = {
  confirmed: 1,
  likely: 0.72,
  supporting: 0.55,
  forest: 0.5,
  negative: -0.85,
  non_forest: -0.7,
}

const SOURCE_LABEL: Record<EvidenceType, string> = {
  satellite: 'Satellite observation',
  vision: 'Visual detection',
  thermal: 'Thermal anomaly',
  weather: 'Weather conditions',
  gis: 'Land cover',
}

export interface ConfidencePoint {
  timestamp: string
  confidence: number
  observationId: string
  label: string
}

export interface KnowledgeStep {
  id: string
  label: string
  reached: boolean
  timestamp?: string
  observationId?: string
}

export interface EvidenceSnapshot {
  asOf: string
  observations: EvidenceObservation[]
  confidence: number
  sources: EvidenceSource[]
  confidenceHistory: ConfidencePoint[]
  knowledgeChain: KnowledgeStep[]
  status: IncidentStatus
  priority: Priority
  reasoning: string
  explainability: { id: string; text: string; positive: boolean }[]
  timeline: TimelineEvent[]
}

function clamp(n: number, min = 0, max = 99): number {
  return Math.round(Math.min(max, Math.max(min, n)))
}

function sortByTime(observations: EvidenceObservation[]): EvidenceObservation[] {
  return [...observations].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )
}

function isPositive(status: EvidenceStatus): boolean {
  return ['confirmed', 'likely', 'supporting', 'forest'].includes(status)
}

function isNegative(status: EvidenceStatus): boolean {
  return ['negative', 'non_forest'].includes(status)
}

/**
 * Demo scoring model — not production wildfire probability.
 * Independent sources outweigh repeats; negatives reduce score.
 * Uses diminishing returns so confidence accumulates over time
 * instead of jumping to a high value after the first few signals.
 */
export function calculateIncidentConfidence(
  observations: EvidenceObservation[],
): number {
  if (!observations.length) return 0

  const ordered = sortByTime(observations)
  let strength = 0
  const seenPositive = new Set<EvidenceType>()
  const seenAny = new Set<EvidenceType>()

  for (const obs of ordered) {
    const weight = Math.abs(STATUS_WEIGHT[obs.status] ?? 0)
    const isRepeat = seenAny.has(obs.source)

    if (isNegative(obs.status)) {
      strength -= (obs.confidence / 100) * weight * (isRepeat ? 0.25 : 0.55)
      seenAny.add(obs.source)
      continue
    }

    if (isPositive(obs.status)) {
      // Independent confirmation contributes far more than same-source repeats.
      const novelty = isRepeat ? 0.2 : 0.85
      strength += (obs.confidence / 100) * weight * novelty
      if (!isRepeat) seenPositive.add(obs.source)
      seenAny.add(obs.source)
    }
  }

  if (seenPositive.size >= 3) strength += 0.15
  if (seenPositive.size >= 4) strength += 0.12
  if (seenPositive.size >= 5) strength += 0.1

  const hasThermalOrSat =
    seenPositive.has('thermal') || seenPositive.has('satellite')
  const hasVision = seenPositive.has('vision')
  const hasContext = seenPositive.has('weather') || seenPositive.has('gis')

  if (hasThermalOrSat && hasVision) strength += 0.14
  if (hasThermalOrSat && hasContext) strength += 0.1

  // Calibrated so A-1847 full evidence lands near ~94 and rises gradually.
  let confidence = 100 * (1 - Math.exp(-0.82 * Math.max(0, strength)))

  if (hasVision && !hasThermalOrSat) {
    confidence = Math.min(confidence, 52)
  }
  if (seenPositive.size <= 1) {
    confidence = Math.min(confidence, 62)
  }

  // Keep contradicted cases readable (not a hard zero) for the false-positive demo.
  const hasNegative = ordered.some((o) => isNegative(o.status))
  if (hasNegative && confidence < 28) {
    confidence = clamp(Math.max(confidence, 24 + strength * 18))
  }

  return clamp(confidence)
}

export function observationsAsOf(
  observations: EvidenceObservation[],
  asOfIso: string,
): EvidenceObservation[] {
  const t = new Date(asOfIso).getTime()
  return sortByTime(observations).filter(
    (o) => new Date(o.timestamp).getTime() <= t,
  )
}

export function buildConfidenceHistory(
  observations: EvidenceObservation[],
): ConfidencePoint[] {
  const ordered = sortByTime(observations)
  const points: ConfidencePoint[] = []
  for (let i = 0; i < ordered.length; i++) {
    const slice = ordered.slice(0, i + 1)
    points.push({
      timestamp: ordered[i].timestamp,
      confidence: calculateIncidentConfidence(slice),
      observationId: ordered[i].id,
      label: ordered[i].type,
    })
  }
  return points
}

export function deriveSources(
  observations: EvidenceObservation[],
): EvidenceSource[] {
  const bySource = new Map<EvidenceType, EvidenceObservation[]>()
  for (const obs of sortByTime(observations)) {
    const list = bySource.get(obs.source) ?? []
    list.push(obs)
    bySource.set(obs.source, list)
  }

  const order: EvidenceType[] = [
    'satellite',
    'vision',
    'thermal',
    'weather',
    'gis',
  ]

  return order
    .filter((type) => bySource.has(type))
    .map((type) => {
      const list = bySource.get(type)!
      const latest = list[list.length - 1]
      const best = list.reduce((a, b) =>
        a.confidence >= b.confidence ? a : b,
      )
      return {
        type,
        label: SOURCE_LABEL[type],
        status: latest.status,
        confidence: best.confidence,
        description: latest.description,
        providerLabel: latest.providerLabel,
        observationCount: list.length,
        latestAt: latest.timestamp,
      }
    })
}

export function deriveIncidentStatus(
  confidence: number,
  observations: EvidenceObservation[],
  preferred?: IncidentStatus,
): IncidentStatus {
  if (preferred === 'contained' || preferred === 'resolved') return preferred

  const negatives = observations.filter((o) => isNegative(o.status)).length
  const positives = observations.filter((o) => isPositive(o.status)).length
  const independent = new Set(
    observations.filter((o) => isPositive(o.status)).map((o) => o.source),
  ).size

  if (negatives >= 2 && independent <= 1 && confidence < 45) {
    return 'false_positive'
  }
  if (confidence >= 88 && independent >= 3) return 'verified'
  if (confidence >= 60 || (positives >= 2 && independent >= 2)) {
    return 'investigating'
  }
  if (confidence > 0 || positives > 0) return 'detected'
  return preferred ?? 'detected'
}

export function derivePriority(
  confidence: number,
  status: IncidentStatus,
  growthPercent: number | null,
  impactRisk: string,
): Priority {
  if (status === 'false_positive' || status === 'resolved') return 'low'
  if (
    confidence >= 85 &&
    (impactRisk === 'high' ||
      impactRisk === 'critical' ||
      (growthPercent != null && growthPercent >= 20))
  ) {
    return growthPercent != null && growthPercent >= 28 ? 'critical' : 'high'
  }
  if (confidence >= 70) return 'medium'
  if (confidence >= 45) return 'medium'
  return 'low'
}

export function buildReasoningFromObservations(
  observations: EvidenceObservation[],
  confidence: number,
): string {
  const sources = deriveSources(observations)
  const negatives = sources.filter((s) => isNegative(s.status))
  const positives = sources.filter((s) => isPositive(s.status))
  const independent = positives.length

  if (confidence < 45 && negatives.length >= 2) {
    return 'Visual anomaly detected, but independent satellite and environmental evidence does not support an active wildfire.'
  }

  if (independent >= 3 && confidence >= 85) {
    const names = positives
      .slice(0, 3)
      .map((s) => s.label.toLowerCase())
      .join(', ')
    return `Multiple independent signals are consistent with an active wildfire. ${names.charAt(0).toUpperCase()}${names.slice(1)} agree across separate observation times.`
  }

  if (independent >= 2) {
    return 'Partial corroboration across sources. Additional independent confirmation would strengthen verification.'
  }

  return 'Limited corroboration so far. AEGIS retains the candidate for audit while awaiting independent signals.'
}

export function buildExplainability(
  observations: EvidenceObservation[],
): { id: string; text: string; positive: boolean }[] {
  const sources = deriveSources(observations)
  const items: { id: string; text: string; positive: boolean }[] = []
  const byType = Object.fromEntries(sources.map((s) => [s.type, s])) as Record<
    string,
    EvidenceSource
  >

  const sat = byType.satellite
  const thermal = byType.thermal
  const vision = byType.vision
  const weather = byType.weather
  const gis = byType.gis

  if (thermal && isPositive(thermal.status)) {
    items.push({
      id: 'ex-thermal',
      text: 'Thermal anomaly detected',
      positive: true,
    })
  } else {
    items.push({
      id: 'ex-thermal',
      text: 'No supporting thermal anomaly',
      positive: false,
    })
  }

  const satObs = observations.filter((o) => o.source === 'satellite')
  if (satObs.length >= 2 && sat && isPositive(sat.status)) {
    items.push({
      id: 'ex-repeat',
      text: 'Repeated observation across satellite passes',
      positive: true,
    })
  } else {
    items.push({
      id: 'ex-repeat',
      text: 'Repeated observation not established',
      positive: false,
    })
  }

  if (vision && isPositive(vision.status)) {
    items.push({
      id: 'ex-smoke',
      text: 'Smoke signature detected',
      positive: true,
    })
  } else {
    items.push({
      id: 'ex-smoke',
      text: 'No reliable visual smoke confirmation',
      positive: false,
    })
  }

  if (weather && isPositive(weather.status)) {
    items.push({
      id: 'ex-wind',
      text: 'Wind / environmental conditions support fire persistence',
      positive: true,
    })
  } else {
    items.push({
      id: 'ex-wind',
      text: 'Environmental conditions do not support active fire',
      positive: false,
    })
  }

  if (gis && (gis.status === 'forest' || gis.status === 'supporting')) {
    items.push({
      id: 'ex-forest',
      text: 'Location overlaps forested / managed area',
      positive: true,
    })
  } else {
    items.push({
      id: 'ex-forest',
      text: 'Land cover inconsistent with typical wildfire context',
      positive: false,
    })
  }

  const history = buildConfidenceHistory(observations)
  if (history.length >= 2) {
    const rising =
      history[history.length - 1].confidence > history[0].confidence
    items.push({
      id: 'ex-trend',
      text: rising
        ? 'Event confidence increased as evidence accumulated'
        : 'Confidence declined as contradictory evidence arrived',
      positive: rising,
    })
  }

  return items
}

export function buildKnowledgeChain(
  observations: EvidenceObservation[],
): KnowledgeStep[] {
  const ordered = sortByTime(observations)
  const initial = ordered[0]

  const firstThermalFamily = ordered.find(
    (o) =>
      (o.source === 'thermal' || o.source === 'satellite') &&
      isPositive(o.status),
  )
  const thermalConfirm = ordered.find(
    (o, idx) =>
      idx > 0 &&
      (o.source === 'thermal' || o.source === 'satellite') &&
      isPositive(o.status),
  )
  const visual = ordered.find(
    (o) => o.source === 'vision' && isPositive(o.status),
  )
  const env = ordered.find(
    (o) => o.source === 'weather' && isPositive(o.status),
  )
  const geo = ordered.find((o) => o.source === 'gis' && isPositive(o.status))
  const repeatObs = ordered.find((o, idx) => {
    if (!isPositive(o.status)) return false
    return ordered
      .slice(0, idx)
      .some((x) => x.source === o.source && isPositive(x.status))
  })

  const confidence = calculateIncidentConfidence(observations)
  const independent = new Set(
    ordered.filter((o) => isPositive(o.status)).map((o) => o.source),
  ).size
  const verified = confidence >= 88 && independent >= 3
  const thermalStep = thermalConfirm ?? firstThermalFamily

  return [
    {
      id: 'initial',
      label: 'Initial anomaly',
      reached: Boolean(initial),
      timestamp: initial?.timestamp,
      observationId: initial?.id,
    },
    {
      id: 'thermal',
      label: 'Thermal confirmation',
      reached: Boolean(thermalStep),
      timestamp: thermalStep?.timestamp,
      observationId: thermalStep?.id,
    },
    {
      id: 'visual',
      label: 'Visual confirmation',
      reached: Boolean(visual),
      timestamp: visual?.timestamp,
      observationId: visual?.id,
    },
    {
      id: 'env',
      label: 'Environmental support',
      reached: Boolean(env),
      timestamp: env?.timestamp,
      observationId: env?.id,
    },
    {
      id: 'geo',
      label: 'Geographic context',
      reached: Boolean(geo),
      timestamp: geo?.timestamp,
      observationId: geo?.id,
    },
    {
      id: 'repeat',
      label: 'Repeated observation',
      reached: Boolean(repeatObs),
      timestamp: repeatObs?.timestamp,
      observationId: repeatObs?.id,
    },
    {
      id: 'verify',
      label: 'AEGIS verification',
      reached: verified,
      timestamp: verified ? ordered[ordered.length - 1]?.timestamp : undefined,
      observationId: verified ? ordered[ordered.length - 1]?.id : undefined,
    },
  ]
}

export function buildTimelineFromObservations(
  observations: EvidenceObservation[],
): TimelineEvent[] {
  const history = buildConfidenceHistory(observations)
  return sortByTime(observations).map((obs, idx) => ({
    id: `tl-${obs.id}`,
    timestamp: obs.timestamp,
    source: obs.providerLabel,
    title: obs.type,
    description: obs.description,
    confidence: history[idx]?.confidence,
    observationId: obs.id,
  }))
}

export function buildEvidenceSnapshot(
  observations: EvidenceObservation[],
  asOfIso: string,
  opts?: {
    preferredStatus?: IncidentStatus
    growthPercent?: number | null
    impactRisk?: string
  },
): EvidenceSnapshot {
  const filtered = observationsAsOf(observations, asOfIso)
  const confidence = calculateIncidentConfidence(filtered)
  const status = deriveIncidentStatus(
    confidence,
    filtered,
    opts?.preferredStatus,
  )
  const priority = derivePriority(
    confidence,
    status,
    opts?.growthPercent ?? null,
    opts?.impactRisk ?? 'low',
  )

  return {
    asOf: asOfIso,
    observations: filtered,
    confidence,
    sources: deriveSources(filtered),
    confidenceHistory: buildConfidenceHistory(filtered),
    knowledgeChain: buildKnowledgeChain(filtered),
    status,
    priority,
    reasoning: buildReasoningFromObservations(filtered, confidence),
    explainability: buildExplainability(filtered),
    timeline: buildTimelineFromObservations(filtered),
  }
}

export function latestObservationTime(
  observations: EvidenceObservation[],
): string {
  const ordered = sortByTime(observations)
  return ordered[ordered.length - 1]?.timestamp ?? new Date().toISOString()
}

/** Map fire-progression scrubber index → reconstruction timestamp for an incident. */
export function progressionTimestamp(
  incidentId: string,
  perimeterIndex: number,
  observations: EvidenceObservation[],
  perimetersLength: number,
): string {
  const ordered = sortByTime(observations)
  if (!ordered.length) return new Date().toISOString()

  if (incidentId === 'A-1847') {
    // T0 / T+30m / T+1h / T+2h aligned to evidence accumulation
    const anchors = [
      '2026-02-14T14:12:00Z',
      '2026-02-14T14:24:00Z',
      '2026-02-14T14:37:00Z',
      '2026-02-14T15:37:00Z',
    ]
    return anchors[Math.min(perimeterIndex, anchors.length - 1)]
  }

  if (perimetersLength <= 1) {
    return latestObservationTime(observations)
  }

  const idx = Math.round(
    (perimeterIndex / Math.max(1, perimetersLength - 1)) *
      (ordered.length - 1),
  )
  return ordered[idx].timestamp
}

export function subtitleFromSnapshot(
  snapshot: EvidenceSnapshot,
  isHistorical?: boolean,
): string {
  if (snapshot.status === 'false_positive') {
    return 'Low confidence · Likely false positive'
  }
  if (isHistorical || snapshot.status === 'resolved') {
    return 'Resolved wildfire · Contained'
  }
  if (snapshot.status === 'verified' && snapshot.priority === 'high') {
    return 'Confirmed wildfire · High priority'
  }
  if (snapshot.status === 'verified' && snapshot.priority === 'critical') {
    return 'Critical growth · Rapid expansion'
  }
  if (snapshot.status === 'investigating') {
    return 'Possible wildfire · Under investigation'
  }
  if (snapshot.status === 'contained') {
    return 'Contained · Monitoring'
  }
  return 'Detected anomaly · Gathering evidence'
}
