import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import { useLocale, useT } from '../../i18n/LocaleContext'
import { formatUtcFull, territoryLabelKey } from '../../utils/format'
import type { TranslationKey } from '../../i18n/en'

const nav: { to: string; labelKey: TranslationKey; idx: string }[] = [
  { to: '/', labelKey: 'nav.overview', idx: '01' },
  { to: '/monitor', labelKey: 'nav.monitor', idx: '02' },
  { to: '/incidents', labelKey: 'nav.incidents', idx: '03' },
  { to: '/analysis', labelKey: 'nav.analysis', idx: '04' },
  { to: '/history', labelKey: 'nav.history', idx: '05' },
  { to: '/settings', labelKey: 'nav.settings', idx: '06' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const t = useT()
  const { locale, setLocale } = useLocale()
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

        <div className="demo-chip">{t('header.demoChip')}</div>

        <div className="header-spacer" />

        <div className="header-meta">
          <div className="lang-switch" role="group" aria-label="Language">
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

          <label className="switch">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            {t('header.demoMode')}
          </label>

          <span className="mono" style={{ fontSize: 11 }}>
            {t('header.updated')} {formatUtcFull(lastUpdated, locale)}
          </span>

          <select
            value={selectedTerritoryId}
            onChange={(e) =>
              setSelectedTerritoryId(e.target.value as string | 'all')
            }
            aria-label={t('header.allAreas')}
          >
            <option value="all">{t('header.allAreas')}</option>
            {territories.map((territory) => {
              const key = territoryLabelKey(territory.id)
              return (
                <option key={territory.id} value={territory.id}>
                  {key ? t(key) : territory.name}
                </option>
              )
            })}
          </select>

          <button
            type="button"
            className="icon-btn"
            title={t('header.notifications')}
            aria-label={t('header.notifications')}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <div className="avatar" title="Operator">
            OP
          </div>
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
            {t(item.labelKey)}
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
            {t('header.explore')}
          </button>
          <button type="button" className="btn" onClick={resetDemo}>
            {t('header.reset')}
          </button>
          <p className="tagline">{t('header.tagline')}</p>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  )
}
