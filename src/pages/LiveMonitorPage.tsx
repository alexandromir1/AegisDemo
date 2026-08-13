import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { AegisMap } from '../components/map/AegisMap'
import { growthLabel, priorityLabelKey, statusLabelKey } from '../utils/format'
import { useT } from '../i18n/LocaleContext'

export function LiveMonitorPage() {
  const { incidents } = useDemo()
  const navigate = useNavigate()
  const t = useT()
  const [selectedId, setSelectedId] = useState<string | null>('A-1847')

  const live = incidents.filter((i) => i.status !== 'resolved')
  const selected = live.find((i) => i.id === selectedId) ?? live[0]

  return (
    <div className="page-wide">
      <div className="live-monitor">
        <div className="live-map-pane">
          <AegisMap
            className="fullscreen"
            incidents={live}
            selectedId={selected?.id}
            onSelect={setSelectedId}
            focusIncident={selected}
            perimeters={selected?.perimeters}
            nearbyAssets={selected?.impact.nearbyAssets}
          />
        </div>

        <aside className="live-side live-side-bottom">
          <div className="live-side-header">
            <div>
              <div className="panel-title">{t('monitor.liveIncidents')}</div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}
              >
                {t('monitor.sub')}
              </div>
            </div>
            {selected && (
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => navigate(`/incidents/${selected.id}`)}
              >
                {t('monitor.openDetail')}
              </button>
            )}
          </div>

          {live.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {t('monitor.empty')}
            </div>
          ) : (
            <div className="live-cards-row">
              {live.map((inc) => (
                <div
                  key={inc.id}
                  className={`incident-card${selected?.id === inc.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(inc.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(inc.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="id">#{inc.id}</div>
                  <div className="loc">{inc.locationLabel}</div>
                  <div className="meta">
                    <span>{t(statusLabelKey(inc.status))}</span>
                    <span>{inc.confidence}%</span>
                    <span>{growthLabel(inc.growthPercent)}</span>
                    <span className={`badge ${inc.priority}`}>
                      {t(priorityLabelKey(inc.priority))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
