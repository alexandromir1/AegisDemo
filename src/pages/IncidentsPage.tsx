import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { formatUtc, growthLabel, statusLabel } from '../utils/format'
import type { IncidentStatus, Priority } from '../types'

export function IncidentsPage() {
  const { incidents, territories } = useDemo()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'all' | IncidentStatus>('all')
  const [priority, setPriority] = useState<'all' | Priority>('all')
  const [confidence, setConfidence] = useState<'all' | 'low' | 'mid' | 'high'>(
    'all',
  )
  const [territory, setTerritory] = useState<'all' | string>('all')

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (status !== 'all' && i.status !== status) return false
      if (priority !== 'all' && i.priority !== priority) return false
      if (territory !== 'all' && i.sector !== territory) return false
      if (confidence === 'low' && i.confidence >= 50) return false
      if (confidence === 'mid' && (i.confidence < 50 || i.confidence >= 85))
        return false
      if (confidence === 'high' && i.confidence < 85) return false
      return true
    })
  }, [incidents, status, priority, confidence, territory])

  return (
    <div className="page">
      <h1 className="page-title">Incidents</h1>
      <p className="page-sub">
        All monitored events across territories. Select an incident to inspect
        evidence, progression and assessment.
      </p>

      <div className="filters">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">All statuses</option>
          <option value="detected">Detected</option>
          <option value="investigating">Investigating</option>
          <option value="verified">Verified</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
          <option value="false_positive">False positive</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as typeof priority)}
        >
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={confidence}
          onChange={(e) => setConfidence(e.target.value as typeof confidence)}
        >
          <option value="all">All confidence</option>
          <option value="low">&lt; 50%</option>
          <option value="mid">50–85%</option>
          <option value="high">≥ 85%</option>
        </select>
        <select
          value={territory}
          onChange={(e) => setTerritory(e.target.value)}
        >
          <option value="all">All territories</option>
          {territories.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Status</th>
              <th>Confidence</th>
              <th>Area</th>
              <th>Growth</th>
              <th>Priority</th>
              <th>Detected</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} onClick={() => navigate(`/incidents/${i.id}`)}>
                <td className="mono" style={{ color: 'var(--accent)' }}>
                  {i.id}
                </td>
                <td>{i.locationLabel}</td>
                <td>
                  <span className={`badge ${i.status}`}>
                    {statusLabel(i.status)}
                  </span>
                </td>
                <td className="mono">{i.confidence}%</td>
                <td className="mono">{i.affectedAreaHa} ha</td>
                <td className="mono">{growthLabel(i.growthPercent)}</td>
                <td>
                  <span className={`badge ${i.priority}`}>{i.priority}</span>
                </td>
                <td className="mono">{formatUtc(i.detectedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
