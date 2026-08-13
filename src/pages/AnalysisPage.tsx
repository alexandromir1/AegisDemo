import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  activityOverTime,
  confidenceDistribution,
  historyStats,
  severityDistribution,
} from '../data/demo/meta'
import { formatHa } from '../utils/format'
import { providers } from '../providers'
import { useT } from '../i18n/LocaleContext'

const chartTooltipStyle = {
  background: '#10161c',
  border: '1px solid #243040',
  fontSize: 12,
}

export function AnalysisPage() {
  const t = useT()
  const sources = providers.incidents.getDataSources()

  return (
    <div className="page">
      <h1 className="page-title">{t('analysis.title')}</h1>
      <p className="page-sub">{t('analysis.sub')}</p>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <h3 className="panel-title">{t('analysis.dataSources')}</h3>
        </div>
        <div className="panel-body">
          <div className="sources-grid">
            {sources.map((s) => (
              <div key={s.id} className="source-card">
                <div className="cat">{s.category}</div>
                <div className="name">{s.name}</div>
                <div className="status">{s.status}</div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s.provider}
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              fontSize: 12,
              color: 'var(--text-muted)',
            }}
          >
            {t('analysis.providerNote')}
          </p>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">{t('analysis.firesDetected')}</div>
          <div className="kpi-value">{historyStats.firesDetected}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('analysis.verifiedFires')}</div>
          <div className="kpi-value">{historyStats.verifiedFires}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('analysis.avgConfidence')}</div>
          <div className="kpi-value accent">{historyStats.averageConfidence}%</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('analysis.avgLatency')}</div>
          <div className="kpi-value">
            {historyStats.averageLatencyMin} {t('analysis.min')}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('analysis.totalAffected')}</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {formatHa(historyStats.totalAffectedHa)}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3 className="panel-title">{t('analysis.activity')}</h3>
          </div>
          <div className="panel-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityOverTime}>
                <CartesianGrid stroke="#1a2430" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#5c6b7a" fontSize={11} />
                <YAxis stroke="#5c6b7a" fontSize={11} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#e8a54b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <h3 className="panel-title">{t('analysis.severity')}</h3>
          </div>
          <div className="panel-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityDistribution}>
                <CartesianGrid stroke="#1a2430" strokeDasharray="3 3" />
                <XAxis dataKey="severity" stroke="#5c6b7a" fontSize={11} />
                <YAxis stroke="#5c6b7a" fontSize={11} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {severityDistribution.map((entry) => (
                    <Cell
                      key={entry.severity}
                      fill={
                        entry.severity === 'Critical'
                          ? '#ff3b2f'
                          : entry.severity === 'High'
                            ? '#d4543a'
                            : entry.severity === 'Medium'
                              ? '#d4a017'
                              : '#6b8f71'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <h3 className="panel-title">{t('analysis.confidenceDist')}</h3>
          </div>
          <div className="panel-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceDistribution}>
                <CartesianGrid stroke="#1a2430" strokeDasharray="3 3" />
                <XAxis dataKey="range" stroke="#5c6b7a" fontSize={11} />
                <YAxis stroke="#5c6b7a" fontSize={11} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#8b9aab" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
