import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { mouAgreementColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import {
  getMouAgreement,
  updateMouAgreement,
} from '../services/registryService'
import { theme } from '../theme'
import { loadMouSelectOptions } from '../utils/mouOptions'

function MouAgreementEditPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { mouId } = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [initialValues, setInitialValues] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadPageData = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const [mou, options] = await Promise.all([
        getMouAgreement(auth.accessToken, mouId),
        loadMouSelectOptions(auth.accessToken),
      ])

      setSelectOptions(options)
      setInitialValues(toMouInitialValues(mou, options))
    } catch (error) {
      setErrorMessage(error.message)
      setInitialValues(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, mouId])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadPageData, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadPageData])

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await updateMouAgreement(auth.accessToken, mouId, values)
      navigate(`/dashboard/mou-agreements/${mouId}`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <FormState title="Loading MoU" message="Preparing the edit form." />
  }

  if (!initialValues) {
    return (
      <FormState
        title="Could not load MoU"
        message={errorMessage || 'The selected MoU could not be found.'}
      />
    )
  }

  return (
    <RegistryForm
      backTo={`/dashboard/mou-agreements/${mouId}`}
      errorMessage={errorMessage}
      fields={mouAgreementColumns}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      selectOptions={selectOptions}
      submitLabel="Update MoU"
      subtitle="Update partner agreement dates, contacts, ownership and progress."
      title="Edit MoU Agreement"
    />
  )
}

function toMouInitialValues(mou, options) {
  return {
    ...mou,
    collaborationArea:
      mou.collaborationAreaId ||
      valueFromLabel(options.collaborationArea, mou.collaborationArea),
    department: mou.departmentId || valueFromLabel(options.department, mou.department),
    partner: mou.partnerId || valueFromLabel(options.partner, mou.partner),
    partnerType:
      mou.partnerTypeId || valueFromLabel(options.partnerType, mou.partnerType),
    renewalRequired:
      mou.renewalRequired === 'Yes'
        ? '1'
        : mou.renewalRequired === 'No'
          ? '0'
          : mou.renewalRequired,
  }
}

function valueFromLabel(options = [], label) {
  const matchingOption = options.find(
    (option) =>
      String(option.label) === String(label) ||
      String(option.value) === String(label),
  )

  return matchingOption?.value || label
}

function FormState({ message, title }) {
  return (
    <section className={`rounded-2xl border p-6 ${theme.classes.dashboardSurface}`}>
      <h2 className={`text-lg font-bold ${theme.classes.heading}`}>{title}</h2>
      <p className={`mt-2 text-sm ${theme.classes.muted}`}>{message}</p>
    </section>
  )
}

export default MouAgreementEditPage
