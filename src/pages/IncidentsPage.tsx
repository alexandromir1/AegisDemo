import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { AegisMap } from '../components/map/AegisMap'
import {
  formatUtc,
  growthLabel,
  priorityLabelKey,
  statusLabelKey,
  territoryLabelKey,
} from '../utils/format'
import type { IncidentStatus, Priority } from '../types'
import { useT } from '../i18n/LocaleContext'

export function IncidentsPage() {
  const { incidents, territories } = useDemo()
  const navigate = useNavigate()
  const t = useT()
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
      <h1 className="page-title">{t('incidents.title')}</h1>
      <p className="page-sub">{t('incidents.sub')}</p>

      <div className="panel incidents-map-panel">
        <div className="panel-header">
          <h3 className="panel-title">{t('incidents.mapTitle')}</h3>
        </div>
        <div className="incidents-map-wrap">
          <AegisMap
            incidents={filtered}
            onSelect={(id) => navigate(`/incidents/${id}`)}
          />
        </div>
      </div>

      <div className="filters">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">{t('incidents.allStatuses')}</option>
          <option value="detected">{t('status.detected')}</option>
          <option value="investigating">{t('status.investigating')}</option>
          <option value="verified">{t('status.verified')}</option>
          <option value="contained">{t('status.contained')}</option>
          <option value="resolved">{t('status.resolved')}</option>
          <option value="false_positive">{t('status.false_positive')}</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as typeof priority)}
        >
          <option value="all">{t('incidents.allPriorities')}</option>
          <option value="low">{t('priority.low')}</option>
          <option value="medium">{t('priority.medium')}</option>
          <option value="high">{t('priority.high')}</option>
          <option value="critical">{t('priority.critical')}</option>
        </select>
        <select
          value={confidence}
          onChange={(e) => setConfidence(e.target.value as typeof confidence)}
        >
          <option value="all">{t('incidents.allConfidence')}</option>
          <option value="low">&lt; 50%</option>
          <option value="mid">50–85%</option>
          <option value="high">≥ 85%</option>
        </select>
        <select
          value={territory}
          onChange={(e) => setTerritory(e.target.value)}
        >
          <option value="all">{t('incidents.allTerritories')}</option>
          {territories.map((item) => {
            const key = territoryLabelKey(item.id)
            return (
              <option key={item.id} value={item.id}>
                {key ? t(key) : item.name}
              </option>
            )
          })}
        </select>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('incidents.col.id')}</th>
              <th>{t('incidents.col.location')}</th>
              <th>{t('incidents.col.status')}</th>
              <th>{t('incidents.col.confidence')}</th>
              <th>{t('incidents.col.area')}</th>
              <th>{t('incidents.col.growth')}</th>
              <th>{t('incidents.col.priority')}</th>
              <th>{t('incidents.col.detected')}</th>
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
                    {t(statusLabelKey(i.status))}
                  </span>
                </td>
                <td className="mono">{i.confidence}%</td>
                <td className="mono">{i.affectedAreaHa} ha</td>
                <td className="mono">{growthLabel(i.growthPercent)}</td>
                <td>
                  <span className={`badge ${i.priority}`}>
                    {t(priorityLabelKey(i.priority))}
                  </span>
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
