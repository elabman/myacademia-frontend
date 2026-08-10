import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { mouAgreementColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { createMouAgreement } from '../services/registryService'
import { loadMouSelectOptions } from '../utils/mouOptions'

function MouAgreementFormPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadSelectOptions = useCallback(async () => {
    setSelectOptions(await loadMouSelectOptions(auth.accessToken))
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadSelectOptions, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSelectOptions])

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await createMouAgreement(auth.accessToken, values)
      navigate('/dashboard/mou-agreements')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RegistryForm
      backTo="/dashboard/mou-agreements"
      errorMessage={errorMessage}
      fields={mouAgreementColumns}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      selectOptions={selectOptions}
      submitLabel="Save MoU"
      subtitle="Capture partner agreement dates, contacts, ownership and progress."
      title="Add MoU Agreement"
    />
  )
}

export default MouAgreementFormPage
