import type { Territory } from '../../types'

/** Tasmania-inspired demo geography — simulated, not live operational data. */
export const territories: Territory[] = [
  {
    id: 'northwest',
    name: 'Northwest Sector',
    areaHa: 482000,
    center: [-41.45, 145.35],
    coordinates: [
      [-41.15, 144.85],
      [-41.15, 145.75],
      [-41.75, 145.85],
      [-41.85, 144.95],
      [-41.15, 144.85],
    ],
  },
  {
    id: 'central',
    name: 'Central Sector',
    areaHa: 615000,
    center: [-42.05, 146.55],
    coordinates: [
      [-41.55, 146.05],
      [-41.55, 147.15],
      [-42.55, 147.25],
      [-42.65, 146.05],
      [-41.55, 146.05],
    ],
  },
  {
    id: 'east',
    name: 'East Sector',
    areaHa: 398000,
    center: [-41.95, 147.85],
    coordinates: [
      [-41.45, 147.35],
      [-41.45, 148.35],
      [-42.45, 148.45],
      [-42.55, 147.35],
      [-41.45, 147.35],
    ],
  },
  {
    id: 'southwest',
    name: 'Southwest Sector',
    areaHa: 345000,
    center: [-42.85, 145.75],
    coordinates: [
      [-42.45, 145.15],
      [-42.45, 146.35],
      [-43.25, 146.45],
      [-43.35, 145.25],
      [-42.45, 145.15],
    ],
  },
]

export const allMonitoredAreaHa = territories.reduce((sum, t) => sum + t.areaHa, 0)

export const demoMapCenter: [number, number] = [-42.0, 146.5]
export const demoMapZoom = 8
