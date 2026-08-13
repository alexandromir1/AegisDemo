import { useParams, Link } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { IncidentDetailView } from '../components/incident/IncidentDetailView'
import { useT } from '../i18n/LocaleContext'

export function IncidentDetailPage() {
  const { id } = useParams()
  const { incidents } = useDemo()
  const t = useT()
  const incident = incidents.find((i) => i.id === id)

  if (!incident) {
    return (
      <div className="page">
        <h1 className="page-title">{t('detail.notFound')}</h1>
        <p className="page-sub">{t('detail.notFoundSub')}</p>
        <Link to="/incidents" className="btn btn-accent">
          {t('detail.back')}
        </Link>
      </div>
    )
  }

  return <IncidentDetailView incident={incident} />
}
