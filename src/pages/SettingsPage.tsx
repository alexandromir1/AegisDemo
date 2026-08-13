import { useDemo } from '../context/DemoContext'
import { providers } from '../providers'

export function SettingsPage() {
  const { demoMode, setDemoMode, resetDemo, mapStyle, setMapStyle } = useDemo()
  const sources = providers.incidents.getDataSources()

  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">
        Lightweight demo controls. Production auth, billing and user management
        are intentionally out of scope.
      </p>

      <div className="settings-block">
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Demo Mode</h3>
          </div>
          <div className="panel-body">
            <label className="switch">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
              />
              Use synthetic / simulated data
            </label>
            <p
              style={{
                marginTop: 12,
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              When enabled, timestamps, satellite layers, weather and incidents
              are simulated and clearly labeled as demo data.
            </p>
            <button
              type="button"
              className="btn"
              style={{ marginTop: 12 }}
              onClick={resetDemo}
            >
              Reset Demo
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Map style</h3>
          </div>
          <div className="panel-body" style={{ display: 'flex', gap: 8 }}>
            {(['satellite', 'terrain', 'dark'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`btn${mapStyle === s ? ' btn-accent' : ''}`}
                onClick={() => setMapStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Provider status</h3>
          </div>
          <div className="panel-body">
            <div className="sources-grid">
              {sources.map((s) => (
                <div key={s.id} className="source-card">
                  <div className="cat">{s.category}</div>
                  <div className="name">{s.name}</div>
                  <div className="status">{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
