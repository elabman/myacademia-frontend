import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { projectColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import {
  createProject,
  listDepartments,
  listDonors,
  listProjectRecords,
  listSectors,
} from '../services/registryService'
import { staticOptions, toOptions } from '../utils/registryOptions'

function ProjectFormPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadSelectOptions = useCallback(async () => {
    const [donors, sectors, departments, projectRecords] = await Promise.all([
      listDonors(auth.accessToken).catch(() => []),
      listSectors(auth.accessToken).catch(() => []),
      listDepartments(auth.accessToken).catch(() => []),
      listProjectRecords(auth.accessToken, { limit: 1000, page: 1 }).catch(
        () => [],
      ),
    ])

    setSelectOptions({
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
    })
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
