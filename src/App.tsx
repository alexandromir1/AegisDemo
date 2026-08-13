import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DemoProvider, useDemo } from './context/DemoContext'
import { AppShell } from './components/layout/AppShell'
import { GuidedTour } from './components/tour/GuidedTour'
import { OverviewPage } from './pages/OverviewPage'
import { LiveMonitorPage } from './pages/LiveMonitorPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { IncidentDetailPage } from './pages/IncidentDetailPage'
import { AnalysisPage } from './pages/AnalysisPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

function AppRoutes() {
  const { tourOpen, setTourOpen, tourStep, setTourStep } = useDemo()

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/monitor" element={<LiveMonitorPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GuidedTour
        open={tourOpen}
        step={tourStep}
        onStep={setTourStep}
        onClose={() => setTourOpen(false)}
      />
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <AppRoutes />
      </DemoProvider>
    </BrowserRouter>
  )
}
