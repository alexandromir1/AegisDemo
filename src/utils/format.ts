export function formatHa(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ha`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k ha`
  return `${value.toFixed(1)} ha`
}

export function formatUtc(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }) + ' UTC'
}

export function formatUtcFull(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      hour12: false,
    }) + ' UTC'
  )
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}

export function growthLabel(growth: number | null): string {
  if (growth === null) return '—'
  if (growth === 0) return '0%'
  return `+${growth}%`
}

export function buildReasoning(sources: { label: string; status: string; confidence: number }[]): string {
  const confirmed = sources.filter((s) =>
    ['confirmed', 'likely', 'supporting', 'forest'].includes(s.status),
  )
  const negative = sources.filter((s) =>
    ['negative', 'non_forest'].includes(s.status),
  )

  if (negative.length >= 2 && confirmed.length <= 2) {
    return 'Visual signal detected, but independent evidence does not support an active wildfire.'
  }

  const parts = confirmed
    .slice(0, 3)
    .map((s) => s.label.toLowerCase())
    .join(', ')

  return `Multiple independent signals indicate an active wildfire. ${parts.charAt(0).toUpperCase() + parts.slice(1)} are consistent with a developing fire.`
}
