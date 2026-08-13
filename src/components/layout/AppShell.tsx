import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import { formatUtcFull } from '../../utils/format'

const nav = [
  { to: '/', label: 'Overview', idx: '01' },
  { to: '/monitor', label: 'Live Monitor', idx: '02' },
  { to: '/incidents', label: 'Incidents', idx: '03' },
  { to: '/analysis', label: 'Analysis', idx: '04' },
  { to: '/history', label: 'History', idx: '05' },
  { to: '/settings', label: 'Settings', idx: '06' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const {
    demoMode,
    setDemoMode,
    selectedTerritoryId,
    setSelectedTerritoryId,
    territories,
    lastUpdated,
    resetDemo,
    setTourOpen,
    setTourStep,
  } = useDemo()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">AE</div>
          <div>
            <div className="brand-name">Aegis</div>
          </div>
        </div>

        <div className="demo-chip">Demo environment · Simulated data</div>

        <div className="header-spacer" />

        <div className="header-meta">
          <label className="switch">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            Demo Mode
          </label>

          <span className="mono" style={{ fontSize: 11 }}>
            Updated {formatUtcFull(lastUpdated)}
          </span>

          <select
            value={selectedTerritoryId}
            onChange={(e) =>
              setSelectedTerritoryId(e.target.value as string | 'all')
            }
            aria-label="Monitored area"
          >
            <option value="all">All monitored areas</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button type="button" className="icon-btn" title="Notifications" aria-label="Notifications">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <div className="avatar" title="Operator">OP</div>
        </div>
      </header>

      <aside className="app-sidebar">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="idx">{item.idx}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => {
              setTourStep(0)
              setTourOpen(true)
            }}
          >
            Explore AEGIS
          </button>
          <button type="button" className="btn" onClick={resetDemo}>
            Reset Demo
          </button>
          <p className="tagline">
            Turns fragmented wildfire signals into one explainable incident.
          </p>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  )
}
