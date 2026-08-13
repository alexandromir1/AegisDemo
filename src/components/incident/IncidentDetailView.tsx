import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  EvidenceObservation,
  EvidenceSource,
  FireEvent,
  TimelineEvent,
} from '../../types'
import { formatUtc, growthLabel, statusLabel } from '../../utils/format'
import { AegisMap } from '../map/AegisMap'
import { useDemo } from '../../context/DemoContext'
import {
  buildEvidenceSnapshot,
  latestObservationTime,
  progressionTimestamp,
  type EvidenceSnapshot,
} from '../../engine/evidenceEngine'

function ConfidenceBar({
  value,
  variant = 'default',
}: {
  value: number
  variant?: 'default' | 'high' | 'low' | 'danger'
}) {
  return (
    <div className={`confidence-bar ${variant}`}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

function barVariant(value: number): 'high' | 'low' | 'danger' | 'default' {
  if (value >= 85) return 'high'
  if (value < 40) return 'danger'
  if (value < 60) return 'low'
  return 'default'
}

function EvidencePanel({
  sources,
  observations,
  confidence,
  reasoning,
  expandedId,
  onToggle,
}: {
  sources: EvidenceSource[]
  observations: EvidenceObservation[]
  confidence: number
  reasoning: string
  expandedId: string | null
  onToggle: (type: string) => void
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Evidence</h3>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          Simulated observations
        </span>
      </div>
      <div className="panel-body">
        <div className="evidence-list">
          {sources.map((s) => {
            const related = observations.filter((o) => o.source === s.type)
            const open = expandedId === s.type
            return (
              <div key={s.type} className={`evidence-item expandable${open ? ' open' : ''}`}>
                <button
                  type="button"
                  className="evidence-summary"
                  onClick={() => onToggle(s.type)}
                >
                  <div className="name">{s.label}</div>
                  <div className="status">{s.status.replace(/_/g, ' ')}</div>
                  <div className="meta">
                    {s.confidence}%
                    {s.providerLabel ? ` · ${s.providerLabel}` : ''}
                    {s.observationCount && s.observationCount > 1
                      ? ` · ${s.observationCount} observations`
                      : ''}
                    <ConfidenceBar
                      value={s.confidence}
                      variant={barVariant(s.confidence)}
                    />
                  </div>
                  <span className="expand-hint">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="evidence-detail">
                    {related.map((obs) => (
                      <div key={obs.id} className="obs-card">
                        <div className="obs-title">{obs.type}</div>
                        <div className="obs-meta">
                          <span>{formatUtc(obs.timestamp)}</span>
                          <span>{obs.providerLabel}</span>
                          <span>{obs.confidence}%</span>
                          <span>{obs.status.replace(/_/g, ' ')}</span>
                        </div>
                        <p>{obs.description}</p>
                        {obs.metadata && (
                          <div className="obs-metadata">
                            {Object.entries(obs.metadata).map(([k, v]) => (
                              <div key={k}>
                                <span>{k}</span>
                                <span>{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="confidence-hero">
          <div className="label">AEGIS Confidence</div>
          <div className="big">{confidence}%</div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-dim)',
              marginTop: 6,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Derived from evidence · demo scoring model
          </div>
        </div>

        <div className="reasoning-box">{reasoning}</div>
      </div>
    </div>
  )
}

function HowAegisKnows({ snapshot }: { snapshot: EvidenceSnapshot }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="panel">
      <button
        type="button"
        className="collapse-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        How AEGIS knows
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="panel-body">
          <p
            style={{
              margin: '0 0 14px',
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            Corroboration chain from simulated observations — not a black-box
            score.
          </p>
          <div className="knowledge-chain">
            {snapshot.knowledgeChain.map((step, idx) => (
              <div
                key={step.id}
                className={`knowledge-step${step.reached ? ' reached' : ''}`}
              >
                {idx > 0 && <div className="knowledge-arrow">↓</div>}
                <div className="knowledge-card">
                  <div className="knowledge-label">{step.label}</div>
                  {step.reached && step.timestamp ? (
                    <div className="knowledge-time">
                      {formatUtc(step.timestamp)}
                    </div>
                  ) : (
                    <div className="knowledge-time pending">Pending</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="confidence-hero" style={{ marginTop: 8 }}>
            <div className="label">AEGIS Confidence</div>
            <div className="big">{snapshot.confidence}%</div>
          </div>
          <div className="reasoning-box">{snapshot.reasoning}</div>

          <ul className="explain-list" style={{ marginTop: 14 }}>
            {snapshot.explainability.map((item) => (
              <li key={item.id}>
                <span className={`mark ${item.positive ? '' : 'neg'}`}>
                  {item.positive ? '✓' : '✗'}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ConfidenceHistory({ snapshot }: { snapshot: EvidenceSnapshot }) {
  if (!snapshot.confidenceHistory.length) return null
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Confidence progression</h3>
      </div>
      <div className="panel-body">
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          Confidence develops as independent evidence arrives — AEGIS does not
          instantly know the answer.
        </p>
        <div className="confidence-history">
          {snapshot.confidenceHistory.map((p) => (
            <div key={p.observationId} className="confidence-history-item">
              <div className="t">{formatUtc(p.timestamp)}</div>
              <div className="bar-wrap">
                <div
                  className="bar-fill"
                  style={{ width: `${p.confidence}%` }}
                />
              </div>
              <div className="v mono">{p.confidence}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelinePanel({
  events,
  selectedId,
  onSelect,
  liveConfidence,
}: {
  events: TimelineEvent[]
  selectedId: string | null
  onSelect: (e: TimelineEvent) => void
  liveConfidence: number
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Incident Timeline</h3>
        <span className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>
          {liveConfidence}% at cursor
        </span>
      </div>
      <div className="panel-body">
        <div className="timeline">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`timeline-item${selectedId === ev.id ? ' active' : ''}`}
              onClick={() => onSelect(ev)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(ev)}
              role="button"
              tabIndex={0}
            >
              <div className="timeline-time">{formatUtc(ev.timestamp)}</div>
              <div className="timeline-title">{ev.title}</div>
              <div className="timeline-desc">{ev.description}</div>
              <div className="timeline-source">
                {ev.source}
                {ev.confidence != null
                  ? ` · AEGIS ${ev.confidence}%`
                  : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FireProgression({
  incident,
  index,
  onChange,
  snapshot,
}: {
  incident: FireEvent
  index: number
  onChange: (i: number) => void
  snapshot: EvidenceSnapshot
}) {
  if (!incident.perimeters.length) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Fire progression</h3>
        </div>
        <div className="panel-body" style={{ color: 'var(--text-muted)' }}>
          No perimeter history for this incident.
        </div>
      </div>
    )
  }

  const p = incident.perimeters[index] ?? incident.perimeters[0]
  const stageHints =
    incident.id === 'A-1847'
      ? [
          'Initial anomaly',
          'Thermal + visual evidence',
          'Corroborated event',
          'Expanding perimeter',
        ]
      : incident.perimeters.map((x) => x.label)

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Fire progression</h3>
        <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>
          AEGIS {snapshot.confidence}% · {growthLabel(incident.growthPercent)}
        </span>
      </div>
      <div className="panel-body">
        <div style={{ height: 280 }}>
          <AegisMap
            compact
            incidents={[
              {
                ...incident,
                confidence: snapshot.confidence,
                status: snapshot.status,
              },
            ]}
            selectedId={incident.id}
            focusIncident={incident}
            perimeters={
              snapshot.confidence < 40 && incident.isFalsePositive
                ? []
                : incident.perimeters
            }
            activePerimeterIndex={
              snapshot.observations.length === 0 ? -1 : index
            }
          />
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          {stageHints[index] ?? p.label} · evidence as of{' '}
          <span className="mono">{formatUtc(snapshot.asOf)}</span>
        </div>
        <div className="progression-controls">
          <span className="mono" style={{ fontSize: 12, minWidth: 48 }}>
            {p.label}
          </span>
          <input
            type="range"
            min={0}
            max={incident.perimeters.length - 1}
            value={index}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <span
            className="mono"
            style={{ fontSize: 12, color: 'var(--text-muted)' }}
          >
            {p.areaHa.toFixed(1)} ha
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {incident.perimeters.map((per, i) => (
            <button
              key={per.label}
              type="button"
              className={`btn${i === index ? ' btn-accent' : ''}`}
              onClick={() => onChange(i)}
            >
              {per.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function WeatherPanel({ incident }: { incident: FireEvent }) {
  const w = incident.weather
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Environmental conditions</h3>
      </div>
      <div className="panel-body">
        <div className="weather-grid">
          {[
            ['Temperature', `${w.temperatureC}°C`],
            ['Humidity', `${w.humidityPercent}%`],
            ['Wind', `${w.windSpeedKmh} km/h ${w.windDirection}`],
            ['Precipitation', `${w.precipitationMm} mm`],
            ['Vegetation dryness', w.vegetationDryness.toUpperCase()],
          ].map(([label, value]) => (
            <div key={label} className="stat-cell">
              <div className="label">{label}</div>
              <div className="value" style={{ fontSize: 16 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="reasoning-box">{w.interpretation}</div>
      </div>
    </div>
  )
}

function ImpactPanel({
  incident,
  detectionConfidence,
}: {
  incident: FireEvent
  detectionConfidence: number
}) {
  const i = incident.impact
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Impact Assessment</h3>
      </div>
      <div className="panel-body">
        <div className="impact-split">
          <div className="stat-cell">
            <div className="label">Detection confidence</div>
            <div className="value">{detectionConfidence}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
              Is there probably a fire?
            </div>
          </div>
          <div className="stat-cell">
            <div className="label">Fire spread risk</div>
            <div className="value" style={{ fontSize: 16 }}>
              {i.fireSpreadRisk.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
              Separate from detection confidence
            </div>
          </div>
        </div>
        <div className="impact-grid" style={{ marginTop: 10 }}>
          {[
            ['Nearby forest assets', String(i.nearbyForestAssets)],
            ['Infrastructure exposure', i.infrastructureExposure.toUpperCase()],
            ['Population exposure', i.populationExposure.toUpperCase()],
            ['Estimated direction', i.estimatedDirection],
          ].map(([label, value]) => (
            <div key={label} className="stat-cell">
              <div className="label">{label}</div>
              <div className="value" style={{ fontSize: 16 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 220, marginTop: 12 }}>
          <AegisMap
            compact
            incidents={[incident]}
            selectedId={incident.id}
            focusIncident={incident}
            nearbyAssets={i.nearbyAssets}
          />
        </div>
        <div className="asset-list">
          {i.nearbyAssets.map((a) => (
            <div key={a.id} className="asset-row">
              <span>
                {a.type.toUpperCase()} · {a.name}
              </span>
              <span className="dist">{a.distanceKm} km</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AssessmentPanel({ incident }: { incident: FireEvent }) {
  return (
    <div className="assessment-box">
      <div className="priority">{incident.assessment.priorityLabel}</div>
      <p>{incident.assessment.summary}</p>
      <div className="panel-title" style={{ marginBottom: 8 }}>
        Recommended actions
      </div>
      <ol className="action-list">
        {incident.assessment.recommendedActions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ol>
      <p
        style={{
          marginTop: 14,
          marginBottom: 0,
          fontSize: 11,
          color: 'var(--text-dim)',
        }}
      >
        Demo recommendations only · Decision support, not autonomous command
      </p>
    </div>
  )
}

function StatusControl({ incident }: { incident: FireEvent }) {
  const { setIncidentStatus } = useDemo()
  const statuses = [
    'detected',
    'investigating',
    'verified',
    'contained',
    'resolved',
  ] as const

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Incident status</h3>
      </div>
      <div className="panel-body">
        <div className="status-flow">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              className={incident.status === s ? 'active' : ''}
              onClick={() => setIncidentStatus(incident.id, s)}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CorroborationCompare({ currentId }: { currentId: string }) {
  if (currentId !== 'A-1847' && currentId !== 'A-1844') return null
  const isConfirmed = currentId === 'A-1847'
  return (
    <div className="panel compare-panel">
      <div className="panel-header">
        <h3 className="panel-title">Corroboration contrast</h3>
      </div>
      <div className="panel-body">
        <div className="compare-grid">
          <div className={`compare-col${isConfirmed ? ' active' : ''}`}>
            <div className="compare-id">A-1847</div>
            <div className="compare-tag">Confirmed wildfire</div>
            <ul>
              <li>Multiple independent signals</li>
              <li>Repeated satellite observation</li>
              <li>Thermal confirmation</li>
              <li>Environmental support</li>
              <li>Confidence increases over time</li>
            </ul>
            {!isConfirmed && (
              <Link to="/incidents/A-1847" className="btn btn-accent">
                Open A-1847
              </Link>
            )}
          </div>
          <div className={`compare-col${!isConfirmed ? ' active' : ''}`}>
            <div className="compare-id">A-1844</div>
            <div className="compare-tag">Likely false positive</div>
            <ul>
              <li>Single / weak visual signal</li>
              <li>No thermal confirmation</li>
              <li>No repeated positive observation</li>
              <li>Weak environmental support</li>
              <li>Confidence decreases</li>
            </ul>
            {isConfirmed && (
              <Link to="/incidents/A-1844" className="btn btn-accent">
                Open A-1844
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function IncidentDetailView({ incident }: { incident: FireEvent }) {
  const fullAsOf = latestObservationTime(incident.observations)
  const [asOf, setAsOf] = useState(fullAsOf)
  const [timelineId, setTimelineId] = useState<string | null>(null)
  const [perimeterIndex, setPerimeterIndex] = useState(
    Math.max(0, incident.perimeters.length - 1),
  )
  const [expandedSource, setExpandedSource] = useState<string | null>(null)

  useEffect(() => {
    setAsOf(latestObservationTime(incident.observations))
    setPerimeterIndex(Math.max(0, incident.perimeters.length - 1))
    setTimelineId(null)
    setExpandedSource(null)
  }, [incident.id, incident.observations, incident.perimeters.length])

  const preserveStatus =
    incident.status === 'contained' || incident.status === 'resolved'
      ? incident.status
      : undefined

  const snapshot = useMemo(
    () =>
      buildEvidenceSnapshot(incident.observations, asOf, {
        preferredStatus: preserveStatus,
        growthPercent: incident.growthPercent,
        impactRisk: incident.impact.fireSpreadRisk,
      }),
    [
      incident.observations,
      asOf,
      preserveStatus,
      incident.growthPercent,
      incident.impact.fireSpreadRisk,
    ],
  )

  // Full evidence timeline always visible; live confidence follows cursor.
  // Operator status changes (from StatusControl) are merged in.
  const fullTimeline = useMemo(() => {
    const evidenceTimeline = buildEvidenceSnapshot(
      incident.observations,
      fullAsOf,
      {
        preferredStatus: preserveStatus,
        growthPercent: incident.growthPercent,
        impactRisk: incident.impact.fireSpreadRisk,
      },
    ).timeline
    const operatorEvents = incident.timeline.filter(
      (t) => t.source === 'Operator',
    )
    return [...evidenceTimeline, ...operatorEvents].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
  }, [
    incident.observations,
    incident.timeline,
    fullAsOf,
    preserveStatus,
    incident.growthPercent,
    incident.impact.fireSpreadRisk,
  ])

  const viewIncident: FireEvent = {
    ...incident,
    confidence: snapshot.confidence,
    status: snapshot.status,
    priority: snapshot.priority,
    sources: snapshot.sources,
    reasoning: snapshot.reasoning,
    explainability: snapshot.explainability,
    assessment:
      snapshot.confidence < 60
        ? {
            priorityLabel: 'EVIDENCE ACCUMULATING',
            summary: snapshot.reasoning,
            recommendedActions: [
              'Continue monitoring',
              'Await independent corroboration',
            ],
          }
        : snapshot.confidence < 88 && snapshot.status !== 'false_positive'
          ? {
              priorityLabel: 'UNDER INVESTIGATION',
              summary: snapshot.reasoning,
              recommendedActions: incident.assessment.recommendedActions.slice(
                0,
                2,
              ),
            }
          : {
              ...incident.assessment,
              summary:
                snapshot.status === 'false_positive'
                  ? snapshot.reasoning
                  : incident.assessment.summary,
            },
  }

  const onTimelineSelect = (ev: TimelineEvent) => {
    setTimelineId(ev.id)
    setAsOf(ev.timestamp)
    // Sync perimeter to nearest progression anchor
    if (incident.perimeters.length) {
      let best = 0
      for (let i = 0; i < incident.perimeters.length; i++) {
        const ts = progressionTimestamp(
          incident.id,
          i,
          incident.observations,
          incident.perimeters.length,
        )
        if (new Date(ts).getTime() <= new Date(ev.timestamp).getTime()) {
          best = i
        }
      }
      setPerimeterIndex(best)
    }
  }

  const onPerimeterChange = (i: number) => {
    setPerimeterIndex(i)
    const ts = progressionTimestamp(
      incident.id,
      i,
      incident.observations,
      incident.perimeters.length,
    )
    setAsOf(ts)
    const match = fullTimeline.find((t) => t.timestamp === ts)
    setTimelineId(match?.id ?? null)
  }

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <h1 className="page-title">{incident.name}</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {incident.subtitle}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
            {incident.locationLabel} · Detected{' '}
            {formatUtc(incident.detectedAt)} · Reconstructing as of{' '}
            <span className="mono">{formatUtc(asOf)}</span>
          </p>
        </div>
        <span className={`badge ${viewIncident.priority}`}>
          {viewIncident.priority}
        </span>
      </div>

      <div className="stat-strip" style={{ marginBottom: 16 }}>
        <div className="stat-cell">
          <div className="label">Confidence</div>
          <div className="value">{snapshot.confidence}%</div>
        </div>
        <div className="stat-cell">
          <div className="label">Affected area</div>
          <div className="value">{incident.affectedAreaHa} ha</div>
        </div>
        <div className="stat-cell">
          <div className="label">Growth</div>
          <div className="value">{growthLabel(incident.growthPercent)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Status</div>
          <div className="value" style={{ fontSize: 16 }}>
            {statusLabel(snapshot.status)}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="panel" style={{ height: 360 }}>
            <AegisMap
              incidents={[viewIncident]}
              selectedId={incident.id}
              focusIncident={incident}
              perimeters={incident.perimeters}
              activePerimeterIndex={perimeterIndex}
              nearbyAssets={incident.impact.nearbyAssets}
              showWind
            />
          </div>

          <EvidencePanel
            sources={snapshot.sources}
            observations={snapshot.observations}
            confidence={snapshot.confidence}
            reasoning={snapshot.reasoning}
            expandedId={expandedSource}
            onToggle={(type) =>
              setExpandedSource((cur) => (cur === type ? null : type))
            }
          />
          <HowAegisKnows snapshot={snapshot} />
          <ConfidenceHistory snapshot={snapshot} />
          <FireProgression
            incident={incident}
            index={perimeterIndex}
            onChange={onPerimeterChange}
            snapshot={snapshot}
          />
          <WeatherPanel incident={incident} />
          <ImpactPanel
            incident={incident}
            detectionConfidence={snapshot.confidence}
          />
          <CorroborationCompare currentId={incident.id} />
        </div>

        <div className="detail-side">
          <AssessmentPanel incident={viewIncident} />
          <StatusControl incident={incident} />
          <TimelinePanel
            events={fullTimeline}
            selectedId={timelineId}
            onSelect={onTimelineSelect}
            liveConfidence={snapshot.confidence}
          />
        </div>
      </div>
    </div>
  )
}
