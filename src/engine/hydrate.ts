import type { FireEvent } from '../types'
import { getEvidenceForIncident } from '../data/demo/evidence'
import {
  buildEvidenceSnapshot,
  latestObservationTime,
  subtitleFromSnapshot,
} from './evidenceEngine'

/**
 * Attach structured observations and overwrite derived fields
 * (confidence, sources, timeline, status, etc.) from the Evidence Engine.
 *
 * Raw incident records may still carry legacy static values for weather,
 * impact, perimeters and assessment copy — detection confidence is derived.
 */
export function hydrateWithEvidence(incident: FireEvent): FireEvent {
  const observations = getEvidenceForIncident(incident.id)
  if (!observations.length) {
    return {
      ...incident,
      observations: incident.observations ?? [],
    }
  }

  const asOf = latestObservationTime(observations)
  const preserveStatus =
    incident.status === 'contained' || incident.status === 'resolved'
      ? incident.status
      : undefined

  const snapshot = buildEvidenceSnapshot(observations, asOf, {
    preferredStatus: preserveStatus,
    growthPercent: incident.growthPercent,
    impactRisk: incident.impact.fireSpreadRisk,
  })

  const isFalsePositive = snapshot.status === 'false_positive'

  let assessment = incident.assessment
  if (isFalsePositive) {
    assessment = {
      priorityLabel: 'LOW CONFIDENCE / LIKELY FALSE POSITIVE',
      summary: snapshot.reasoning,
      recommendedActions: [
        'Keep in audit trail',
        'Do not escalate alert',
        'Review vision false-positive cluster later',
      ],
    }
  } else if (snapshot.status === 'verified' && incident.id === 'A-1847') {
    assessment = {
      ...incident.assessment,
      priorityLabel: 'HIGH PRIORITY',
      summary: `${snapshot.reasoning} The incident is actively expanding toward a managed forest block. Current wind conditions favor northeastward movement. Continued monitoring is recommended.`,
    }
  }

  return {
    ...incident,
    observations,
    confidence: snapshot.confidence,
    sources: snapshot.sources,
    timeline: snapshot.timeline,
    reasoning: snapshot.reasoning,
    explainability: snapshot.explainability,
    status: snapshot.status,
    priority: snapshot.priority,
    subtitle: subtitleFromSnapshot(snapshot, incident.isHistorical),
    isFalsePositive,
    assessment,
    detectedAt: observations[0]?.timestamp ?? incident.detectedAt,
  }
}
