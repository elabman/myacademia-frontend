import RegistryTable from '../components/RegistryTable'
import { projectColumns, projects } from '../data/registryData'

function ProjectsPage() {
  return (
    <RegistryTable
      addTo="/dashboard/projects/new"
      columns={projectColumns}
      eyebrow="Projects Registry"
      quickColumns={[
        'sn',
        'title',
        'donor',
        'fundingType',
        'sector',
        'coordinator',
        'startDate',
        'endDate',
        'budgetUsd',
        'status',
      ]}
      rows={projects}
      title="Projects"
    />
  )
}

export default ProjectsPage
