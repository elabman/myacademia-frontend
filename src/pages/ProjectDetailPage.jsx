import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectProfileDetail from '../components/ProjectProfileDetail'
import { useAuth } from '../hooks/useAuth'
import { deleteProject, getProject } from '../services/registryService'

function ProjectDetailPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState(null)

  const loadProject = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      setProject(await getProject(auth.accessToken, projectId))
    } catch (error) {
      setErrorMessage(error.message)
      setProject(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, projectId])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadProject, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadProject])

  const handleDelete = async () => {
    if (!project || !window.confirm(`Delete "${project.title}"?`)) {
      return
    }

    setErrorMessage('')
    setIsDeleting(true)

    try {
      await deleteProject(auth.accessToken, projectId)
      navigate('/dashboard/projects')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ProjectProfileDetail
      backTo="/dashboard/projects"
      editTo={`/dashboard/projects/${projectId}/edit`}
      errorMessage={errorMessage}
      isDeleting={isDeleting}
      isLoading={isLoading}
      onDelete={project ? handleDelete : undefined}
      project={project}
    />
  )
}

export default ProjectDetailPage
