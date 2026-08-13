import { useNavigate } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { AegisMap } from '../components/map/AegisMap'
import { formatHa } from '../utils/format'

export function OverviewPage() {
  const { kpis, incidents } = useDemo()
  const navigate = useNavigate()

  const active = incidents.filter(
    (i) => !['resolved', 'false_positive'].includes(i.status),
  )

  return (
    <div className="page">
      <h1 className="page-title">AEGIS Wildfire Intelligence</h1>
      <p className="page-sub">
        Detect · Verify · Track · Understand — AEGIS combines fragmented wildfire
        signals into one explainable incident.
      </p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Active incidents</div>
          <div className="kpi-value">{kpis.activeIncidents}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">High priority</div>
          <div className="kpi-value danger">{kpis.highPriority}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Monitored area</div>
          <div className="kpi-value" style={{ fontSize: 24 }}>
            {formatHa(kpis.monitoredAreaHa)}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Verified today</div>
          <div className="kpi-value">{kpis.verifiedToday}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg detection confidence</div>
          <div className="kpi-value accent">{kpis.averageConfidence}%</div>
        </div>
      </div>

      <div className="overview-map-wrap">
        <AegisMap
          incidents={active}
          onSelect={(id) => navigate(`/incidents/${id}`)}
        />
      </div>
    </div>
  )
}
