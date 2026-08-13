import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { AegisMap } from '../components/map/AegisMap'
import { growthLabel, statusLabel } from '../utils/format'

export function LiveMonitorPage() {
  const { incidents } = useDemo()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>('A-1847')

  const live = incidents.filter((i) => i.status !== 'resolved')
  const selected = live.find((i) => i.id === selectedId) ?? live[0]

  return (
    <div className="page-wide">
      <div className="live-layout">
        <AegisMap
          className="fullscreen"
          incidents={live}
          selectedId={selected?.id}
          onSelect={setSelectedId}
          focusIncident={selected}
          perimeters={selected?.perimeters}
          nearbyAssets={selected?.impact.nearbyAssets}
        />
        <aside className="live-side">
          <div className="panel-title" style={{ marginBottom: 12 }}>
            Live incidents
          </div>
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
                <span>{statusLabel(inc.status)}</span>
                <span>{inc.confidence}%</span>
                <span>{growthLabel(inc.growthPercent)}</span>
                <span className={`badge ${inc.priority}`}>{inc.priority}</span>
              </div>
            </div>
          ))}
          {selected && (
            <button
              type="button"
              className="btn btn-accent"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => navigate(`/incidents/${selected.id}`)}
            >
              Open incident detail
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}
