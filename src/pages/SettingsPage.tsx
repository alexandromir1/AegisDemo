import { useDemo } from '../context/DemoContext'
import { providers } from '../providers'
import { useLocale, useT } from '../i18n/LocaleContext'

export function SettingsPage() {
  const { demoMode, setDemoMode, resetDemo, mapStyle, setMapStyle } = useDemo()
  const { locale, setLocale } = useLocale()
  const t = useT()
  const sources = providers.incidents.getDataSources()

  return (
    <div className="page">
      <h1 className="page-title">{t('settings.title')}</h1>
      <p className="page-sub">{t('settings.sub')}</p>

      <div className="settings-block">
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">{t('settings.language')}</h3>
          </div>
          <div className="panel-body">
            <p
              style={{
                marginTop: 0,
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              {t('settings.languageHelp')}
            </p>
            <div className="lang-switch" style={{ marginTop: 8 }}>
              <button
                type="button"
                className={locale === 'en' ? 'active' : ''}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={locale === 'ru' ? 'active' : ''}
                onClick={() => setLocale('ru')}
              >
                RU
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">{t('settings.demoMode')}</h3>
          </div>
          <div className="panel-body">
            <label className="switch">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
              />
              {t('settings.demoToggle')}
            </label>
            <p
              style={{
                marginTop: 12,
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              {t('settings.demoHelp')}
            </p>
            <button
              type="button"
              className="btn"
              style={{ marginTop: 12 }}
              onClick={resetDemo}
            >
              {t('settings.reset')}
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">{t('settings.mapStyle')}</h3>
          </div>
          <div className="panel-body" style={{ display: 'flex', gap: 8 }}>
            {(['satellite', 'terrain', 'dark'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`btn${mapStyle === s ? ' btn-accent' : ''}`}
                onClick={() => setMapStyle(s)}
              >
                {t(`map.style.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">{t('settings.providers')}</h3>
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
