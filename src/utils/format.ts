import type { TranslationKey } from '../i18n/en'

export function formatHa(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ha`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k ha`
  return `${value.toFixed(1)} ha`
}

export function formatUtc(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      hour12: false,
    }) + ' UTC'
  )
}

export function formatUtcFull(iso: string, locale: 'en' | 'ru' = 'en'): string {
  const d = new Date(iso)
  return (
    d.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
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

export function statusLabelKey(status: string): TranslationKey {
  const key = `status.${status}` as TranslationKey
  return key
}

export function priorityLabelKey(priority: string): TranslationKey {
  return `priority.${priority}` as TranslationKey
}

export function territoryLabelKey(id: string): TranslationKey | null {
  const map: Record<string, TranslationKey> = {
    northwest: 'territory.northwest',
    central: 'territory.central',
    east: 'territory.east',
    southwest: 'territory.southwest',
  }
  return map[id] ?? null
}

export function growthLabel(growth: number | null): string {
  if (growth === null) return '—'
  if (growth === 0) return '0%'
  return `+${growth}%`
}

/** @deprecated Prefer t(statusLabelKey(status)) */
export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}
