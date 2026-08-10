import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RegistryDetail from '../components/RegistryDetail'
import { mouAgreementColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import {
  deleteMouAgreement,
  getMouAgreement,
} from '../services/registryService'

function MouAgreementDetailPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { mouId } = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mou, setMou] = useState(null)

  const loadMou = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      setMou(await getMouAgreement(auth.accessToken, mouId))
    } catch (error) {
      setErrorMessage(error.message)
      setMou(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, mouId])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadMou, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadMou])

  const handleDelete = async () => {
    if (!mou || !window.confirm(`Delete MoU with "${mou.partner}"?`)) {
      return
    }

    setErrorMessage('')
    setIsDeleting(true)

    try {
      await deleteMouAgreement(auth.accessToken, mouId)
      navigate('/dashboard/mou-agreements')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <RegistryDetail
      backTo="/dashboard/mou-agreements"
      columns={mouAgreementColumns}
      editTo={`/dashboard/mou-agreements/${mouId}/edit`}
      errorMessage={errorMessage}
      isDeleting={isDeleting}
      isLoading={isLoading}
      onDelete={mou ? handleDelete : undefined}
      record={mou}
      title="MoU Agreement"
    />
  )
}

export default MouAgreementDetailPage
