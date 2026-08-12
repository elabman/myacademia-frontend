import { useCallback, useEffect, useState } from 'react'
import RegistryTable from '../components/RegistryTable'
import { mouAgreementColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import {
  deleteMouAgreement,
  listMouAgreements,
} from '../services/registryService'

function MouAgreementsPage() {
  const { auth } = useAuth()
  const [deletingId, setDeletingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [mouAgreements, setMouAgreements] = useState([])

  const loadMouAgreements = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await listMouAgreements(auth.accessToken, {
        limit: 100,
        order: 'asc',
        page: 1,
        sort: 'created_at',
      })
      setMouAgreements(result.rows)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadMouAgreements, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadMouAgreements])

  const handleDelete = async (mou) => {
    const mouId = mou.id ?? mou.sn

    if (!window.confirm(`Delete MoU with "${mou.partner}"?`)) {
      return
    }

    setErrorMessage('')
    setDeletingId(mouId)

    try {
      await deleteMouAgreement(auth.accessToken, mouId)
      setMouAgreements((currentMous) =>
        currentMous.filter((item) => String(item.id ?? item.sn) !== String(mouId)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <RegistryTable
      addTo="/dashboard/mou-agreements/new"
      columns={mouAgreementColumns}
      emptyMessage="No MoU agreements have been added yet."
      errorMessage={errorMessage}
      eyebrow="Partner Agreements"
      isDeletingId={deletingId}
      isLoading={isLoading}
      onDeleteRow={handleDelete}
      onRefresh={loadMouAgreements}
      quickColumns={[
        'sn',
        'partner',
        'partnerType',
        'country',
        'department',
        'dateSigned',
        'expiryDate',
        'status',
        'progressStatus',
        'renewalRequired',
      ]}
      rows={mouAgreements}
      title="MoU Agreements"
    />
  )
}

export default MouAgreementsPage
