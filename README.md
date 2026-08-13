# AEGIS — Wildfire Intelligence Demo

Interactive product prototype for **AEGIS**, a wildfire intelligence and decision-support platform.

> AEGIS doesn't just detect a wildfire. It builds an intelligence picture around the event.

This demo uses **synthetic / simulated data**. It is designed so mock providers can later be replaced with real satellite, weather, and vision services.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Demo flow

1. **Overview** — KPIs + map of monitored territories
2. Click **A-1847** (or open Incidents → A-1847)
3. Inspect **94% confidence**, evidence sources, and “Why AEGIS?”
4. Scrub **Fire progression**
5. Review **weather**, **impact**, and **AEGIS assessment**
6. Try **History → Replay** for event reconstruction
7. Open **A-1844** for the false-positive trust case

Use **Explore AEGIS** in the sidebar for a guided walkthrough.

## Evidence Engine (v0.2)

Detection confidence is **derived** from structured simulated observations:

- `src/data/demo/evidence.ts` — observation records
- `src/engine/evidenceEngine.ts` — demo scoring model (not production probability)
- Incident detail timeline / fire progression scrubbers reconstruct evidence over time

Compare **A-1847** (corroborated wildfire) with **A-1844** (likely false positive).


Provider stubs (`FIRMSProvider`, `YOLOv5Provider`) show how demo providers can be swapped without changing UI code.

## Stack

- Vite + React + TypeScript
- React Router
- Leaflet / react-leaflet
- Recharts

## Notes

- Geography is Tasmania-inspired for visual realism — **not live Tasmania operational data**
- Vision signal is labeled **DEMO / YOLOv5** (internal prototype limitation)
- Recommendations are decision-support demos only
