import { useT } from '../../i18n/LocaleContext'

const stepKeys = [1, 2, 3, 4, 5, 6] as const

interface GuidedTourProps {
  open: boolean
  step: number
  onStep: (n: number) => void
  onClose: () => void
}

export function GuidedTour({ open, step, onStep, onClose }: GuidedTourProps) {
  const t = useT()
  if (!open) return null

  const n = stepKeys[step]
  const titleKey = `tour.${n}.title` as const
  const bodyKey = `tour.${n}.body` as const

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true">
      <div className="tour-card">
        <div className="step">
          {t('tour.step')} {step + 1} / {stepKeys.length}
        </div>
        <h3>{t(titleKey)}</h3>
        <p>{t(bodyKey)}</p>
        <div className="tour-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('tour.dismiss')}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn"
              disabled={step === 0}
              onClick={() => onStep(step - 1)}
            >
              {t('tour.back')}
            </button>
            {step < stepKeys.length - 1 ? (
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => onStep(step + 1)}
              >
                {t('tour.next')}
              </button>
            ) : (
              <button type="button" className="btn btn-accent" onClick={onClose}>
                {t('tour.start')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
