const steps = [
  {
    title: 'An anomaly was detected.',
    body: 'AEGIS continuously monitors satellite and environmental feeds for unusual thermal and visual signals across managed territories.',
  },
  {
    title: 'Multiple data sources confirm the signal.',
    body: 'Satellite, thermal, vision, weather and land-cover layers are fused so no single noisy signal drives a decision.',
  },
  {
    title: 'AEGIS evaluates fire confidence.',
    body: 'Evidence is scored and explained. Confidence reflects agreement across independent sources — not a black-box score.',
  },
  {
    title: 'The system tracks fire progression.',
    body: 'Perimeters and growth are reconstructed over time so operators can see how an event developed.',
  },
  {
    title: 'Environmental conditions indicate likely spread.',
    body: 'Wind, humidity and vegetation dryness provide context for where the fire may move next.',
  },
  {
    title: 'AEGIS generates an operational assessment.',
    body: 'Recommended priorities support human decision-making. AEGIS does not replace operational command.',
  },
]

interface GuidedTourProps {
  open: boolean
  step: number
  onStep: (n: number) => void
  onClose: () => void
}

export function GuidedTour({ open, step, onStep, onClose }: GuidedTourProps) {
  if (!open) return null
  const current = steps[step]

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true">
      <div className="tour-card">
        <div className="step">
          Step {step + 1} / {steps.length}
        </div>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        <div className="tour-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Dismiss
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn"
              disabled={step === 0}
              onClick={() => onStep(step - 1)}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => onStep(step + 1)}
              >
                Next
              </button>
            ) : (
              <button type="button" className="btn btn-accent" onClick={onClose}>
                Start exploring
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
