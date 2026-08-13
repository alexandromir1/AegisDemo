import { useParams, Link } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { IncidentDetailView } from '../components/incident/IncidentDetailView'

export function IncidentDetailPage() {
  const { id } = useParams()
  const { incidents } = useDemo()
  const incident = incidents.find((i) => i.id === id)

  if (!incident) {
    return (
      <div className="page">
        <h1 className="page-title">Incident not found</h1>
        <p className="page-sub">No demo incident matches this ID.</p>
        <Link to="/incidents" className="btn btn-accent">
          Back to incidents
        </Link>
      </div>
    )
  }

  return <IncidentDetailView incident={incident} />
}
