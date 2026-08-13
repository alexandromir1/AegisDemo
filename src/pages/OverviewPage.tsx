import { useNavigate } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { AegisMap } from '../components/map/AegisMap'
import { formatHa } from '../utils/format'
import { useT } from '../i18n/LocaleContext'

export function OverviewPage() {
  const { kpis, incidents } = useDemo()
  const navigate = useNavigate()
  const t = useT()

  const active = incidents.filter(
    (i) => !['resolved', 'false_positive'].includes(i.status),
  )

  return (
    <div className="page">
      <h1 className="page-title">{t('overview.title')}</h1>
      <p className="page-sub">{t('overview.sub')}</p>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">{t('overview.kpi.active')}</div>
          <div className="kpi-value">{kpis.activeIncidents}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('overview.kpi.high')}</div>
          <div className="kpi-value danger">{kpis.highPriority}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('overview.kpi.area')}</div>
          <div className="kpi-value" style={{ fontSize: 24 }}>
            {formatHa(kpis.monitoredAreaHa)}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('overview.kpi.verified')}</div>
          <div className="kpi-value">{kpis.verifiedToday}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('overview.kpi.confidence')}</div>
          <div className="kpi-value accent">{kpis.averageConfidence}%</div>
        </div>
      </div>

      <div className="panel overview-map-panel">
        <div className="panel-header">
          <h3 className="panel-title">{t('overview.mapTitle')}</h3>
        </div>
        <div className="overview-map-wrap">
          <AegisMap
            incidents={active}
            onSelect={(id) => navigate(`/incidents/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}
