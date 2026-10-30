import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { projectColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { createProject } from '../services/registryService'
import { loadProjectSelectOptions } from '../utils/registrySelectOptions'

function ProjectFormPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadSelectOptions = useCallback(async () => {
    setSelectOptions(await loadProjectSelectOptions(auth.accessToken))
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadSelectOptions, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSelectOptions])

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await createProject(auth.accessToken, values)
      navigate('/dashboard/projects')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RegistryForm
      backTo="/dashboard/projects"
      errorMessage={errorMessage}
      fields={projectColumns}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      selectOptions={selectOptions}
      submitLabel="Save Project"
      subtitle="Capture project identity, funding, timeline and performance information."
      title="Add Project"
    />
  )
}

export default ProjectFormPage
