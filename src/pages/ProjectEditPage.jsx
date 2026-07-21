import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { projectColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import {
  getProject,
  listDepartments,
  listDonors,
  listProjectRecords,
  listSectors,
  updateProject,
} from '../services/registryService'
import { theme } from '../theme'
import { staticOptions, toOptions } from '../utils/registryOptions'

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
      const [project, donors, sectors, departments, projectRecords] =
        await Promise.all([
          getProject(auth.accessToken, projectId),
          listDonors(auth.accessToken).catch(() => []),
          listSectors(auth.accessToken).catch(() => []),
          listDepartments(auth.accessToken).catch(() => []),
          listProjectRecords(auth.accessToken, { limit: 1000, page: 1 }).catch(
            () => [],
          ),
        ])

      const options = {
        departments: toOptions(
          departments,
          ['department_name', 'name'],
          ['department_id', 'id', 'value'],
        ),
        donor: toOptions(
          donors,
          ['donor_name', 'name', 'funding_agency'],
          ['donor_id', 'id', 'value'],
        ),
        fundingType: toOptions(
          projectRecords,
          ['funding_type_name', 'funding_type', 'fundingType'],
          ['funding_type_id'],
        ),
        sector: toOptions(
          sectors,
          ['sector_name', 'name'],
          ['sector_id', 'id', 'value'],
        ),
        status: staticOptions([
          'Pipeline',
          'Active',
          'Completed',
          'Suspended',
          'Cancelled',
        ]),
      }

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
