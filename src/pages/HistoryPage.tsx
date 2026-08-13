import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDemo } from '../context/DemoContext'
import { AegisMap } from '../components/map/AegisMap'
import {
  activityOverTime,
  confidenceDistribution,
  historyStats,
  severityDistribution,
} from '../data/demo/meta'
import { replayFrames } from '../data/demo/incidents'
import { formatHa, territoryLabelKey } from '../utils/format'
import { useT } from '../i18n/LocaleContext'

const chartTooltipStyle = {
  background: '#10161c',
  border: '1px solid #243040',
  fontSize: 12,
}

function usePlayback(playing: boolean, onTick: () => void) {
  const tickRef = useRef(onTick)
  tickRef.current = onTick
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => tickRef.current(), 1200)
    return () => window.clearInterval(id)
  }, [playing])
}

export function HistoryPage() {
  const t = useT()
  const { territories, incidents } = useDemo()
  const [territory, setTerritory] = useState('all')
  const [season, setSeason] = useState('all')
  const [replayIndex, setReplayIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const primary = incidents.find((i) => i.id === 'A-1847')!
  const frame = replayFrames[replayIndex]
  const perimeterIndex = frame.perimeterIndex ?? -1

  usePlayback(playing, () => {
    setReplayIndex((i) => {
      if (i >= replayFrames.length - 1) {
        setPlaying(false)
        return i
      }
      return i + 1
    })
  })

  return (
    <div className="page">
      <h1 className="page-title">{t('history.title')}</h1>
      <p className="page-sub">{t('history.sub')}</p>

      <div className="filters">
        <select value={territory} onChange={(e) => setTerritory(e.target.value)}>
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
        <select value={season} onChange={(e) => setSeason(e.target.value)}>
          <option value="all">{t('history.allSeasons')}</option>
          <option value="summer">{t('history.summer')}</option>
          <option value="autumn">{t('history.autumn')}</option>
          <option value="winter">{t('history.winter')}</option>
          <option value="spring">{t('history.spring')}</option>
        </select>
        <select defaultValue="2025-2026">
          <option>2025–2026</option>
          <option>2024–2025</option>
        </select>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">{t('history.firesDetected')}</div>
          <div className="kpi-value">{historyStats.firesDetected}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('history.verified')}</div>
          <div className="kpi-value">{historyStats.verifiedFires}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('history.avgConfidence')}</div>
          <div className="kpi-value accent">{historyStats.averageConfidence}%</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('history.avgLatency')}</div>
          <div className="kpi-value">
            {historyStats.averageLatencyMin} {t('analysis.min')}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{t('history.totalArea')}</div>
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
          <div className="panel-body" style={{ height: 220 }}>
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
          <div className="panel-body" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityDistribution}>
                <CartesianGrid stroke="#1a2430" strokeDasharray="3 3" />
                <XAxis dataKey="severity" stroke="#5c6b7a" fontSize={11} />
                <YAxis stroke="#5c6b7a" fontSize={11} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#d4543a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel chart-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <h3 className="panel-title">{t('analysis.confidenceDist')}</h3>
          </div>
          <div className="panel-body" style={{ height: 200 }}>
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

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <h3 className="panel-title">{t('history.replay')}</h3>
          <Link to="/incidents/A-1847" className="btn">
            {t('history.openDetail')}
          </Link>
        </div>
        <div className="detail-map-wrap">
          <AegisMap
            incidents={frame.showMarker ? [primary] : []}
            focusIncident={primary}
            perimeters={primary.perimeters}
            activePerimeterIndex={perimeterIndex}
            replayMarker={{
              lat: primary.latitude,
              lng: primary.longitude,
              show: frame.showMarker,
            }}
          />
        </div>
        <div className="replay-bar">
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => {
              if (replayIndex >= replayFrames.length - 1) setReplayIndex(0)
              setPlaying((p) => !p)
            }}
          >
            {playing ? t('history.pause') : t('history.replayBtn')}
          </button>
          <span className="frame-label">{frame.label}</span>
          <input
            type="range"
            min={0}
            max={replayFrames.length - 1}
            value={replayIndex}
            onChange={(e) => {
              setPlaying(false)
              setReplayIndex(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
          <div style={{ flex: 1.2 }}>
            <div style={{ fontSize: 13 }}>{frame.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {frame.description}
              {frame.confidence != null ? ` · ${frame.confidence}%` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
