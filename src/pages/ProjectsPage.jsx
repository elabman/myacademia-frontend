import { useCallback, useEffect, useState } from 'react'
import RegistryTable from '../components/RegistryTable'
import { projectColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { deleteProject, listProjects } from '../services/registryService'

function ProjectsPage() {
  const { auth } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState([])

  const loadProjects = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await listProjects(auth.accessToken, {
        limit: 100,
        page: 1,
      })
      setProjects(result.rows)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadProjects, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadProjects])

  const handleDeleteProject = async (project) => {
    const projectId = project.id ?? project.sn

    if (!window.confirm(`Delete "${project.title}"?`)) {
      return
    }

    setErrorMessage('')
    setDeletingId(projectId)

    try {
      await deleteProject(auth.accessToken, projectId)
      setProjects((currentProjects) =>
        currentProjects.filter((item) => String(item.id ?? item.sn) !== String(projectId)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <RegistryTable
      addTo="/dashboard/projects/new"
      columns={projectColumns}
      emptyMessage="No projects have been added yet."
      errorMessage={errorMessage}
      eyebrow="Projects Registry"
      isDeletingId={deletingId}
      isLoading={isLoading}
      onDeleteRow={handleDeleteProject}
      onRefresh={loadProjects}
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
