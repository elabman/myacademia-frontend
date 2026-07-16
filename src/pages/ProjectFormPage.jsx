import RegistryForm from '../components/RegistryForm'
import { projectColumns } from '../data/registryData'

function ProjectFormPage() {
  return (
    <RegistryForm
      backTo="/dashboard/projects"
      fields={projectColumns}
      title="Add Project"
    />
  )
}

export default ProjectFormPage
