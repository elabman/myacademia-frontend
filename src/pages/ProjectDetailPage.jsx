import { useParams } from 'react-router-dom'
import RegistryDetail from '../components/RegistryDetail'
import { projectColumns, projects } from '../data/registryData'

function ProjectDetailPage() {
  const { projectId } = useParams()
  const project = projects.find((item) => String(item.sn) === projectId)

  return (
    <RegistryDetail
      backTo="/dashboard/projects"
      columns={projectColumns}
      record={project}
      title="Project Details"
    />
  )
}

export default ProjectDetailPage
