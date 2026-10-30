import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { projectColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { getProject, updateProject } from '../services/registryService'
import { theme } from '../theme'
import { loadProjectSelectOptions } from '../utils/registrySelectOptions'

function ProjectEditPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [initialValues, setInitialValues] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadPageData = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const [project, options] = await Promise.all([
        getProject(auth.accessToken, projectId),
        loadProjectSelectOptions(auth.accessToken),
      ])

      setInitialValues(toProjectInitialValues(project, options))
      setSelectOptions(options)
    } catch (error) {
      setErrorMessage(error.message)
      setInitialValues(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, projectId])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadPageData, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadPageData])

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await updateProject(auth.accessToken, projectId, values)
      navigate(`/dashboard/projects/${projectId}`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <FormState title="Loading project" message="Preparing the edit form." />
  }

  if (!initialValues) {
    return (
      <FormState
        title="Could not load project"
        message={errorMessage || 'The selected project could not be found.'}
      />
    )
  }

  return (
    <RegistryForm
      backTo={`/dashboard/projects/${projectId}`}
      errorMessage={errorMessage}
      fields={projectColumns}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      selectOptions={selectOptions}
      submitLabel="Update Project"
      subtitle="Update project identity, funding, timeline and performance information."
      title="Edit Project"
    />
  )
}

function toProjectInitialValues(project, options) {
  return {
    ...project,
    donor: project.donorId || valueFromLabel(options.donor, project.donor),
    fundingType:
      project.fundingTypeId || valueFromLabel(options.fundingType, project.fundingType),
    sector: project.sectorId || valueFromLabel(options.sector, project.sector),
    coordinator:
      project.coordinatorId || valueFromLabel(options.coordinator, project.coordinator),
    beneficiaryType:
      project.beneficiaryTypeId ||
      valueFromLabel(options.beneficiaryType, project.beneficiaryType),
    departments:
      project.departmentId || valueFromLabel(options.departments, project.departments),
    achievement: numericValue(project.achievement),
    beneficiaries: numericValue(project.beneficiaries),
    budgetRwf: numericValue(project.budgetRwf),
    budgetUsd: numericValue(project.budgetUsd),
    collegeContribution: numericValue(project.collegeContribution),
    donorContribution: numericValue(project.donorContribution),
  }
}

function valueFromLabel(options = [], label) {
  const matchingOption = options.find((option) => option.label === label)
  return matchingOption?.value || label
}

function numericValue(value) {
  if (!value || value === '-') {
    return ''
  }

  return String(value).replaceAll(',', '').replace('%', '')
}

function FormState({ message, title }) {
  return (
    <section className={`rounded-2xl border p-6 ${theme.classes.dashboardSurface}`}>
      <h2 className={`text-lg font-bold ${theme.classes.heading}`}>{title}</h2>
      <p className={`mt-2 text-sm ${theme.classes.muted}`}>{message}</p>
    </section>
  )
}

export default ProjectEditPage
