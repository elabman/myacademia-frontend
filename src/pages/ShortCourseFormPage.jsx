import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { shortCourseColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { createShortCourse } from '../services/registryService'
import { loadShortCourseSelectOptions } from '../utils/registrySelectOptions'

function ShortCourseFormPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadSelectOptions = useCallback(async () => {
    setSelectOptions(await loadShortCourseSelectOptions(auth.accessToken))
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadSelectOptions, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadSelectOptions])

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await createShortCourse(auth.accessToken, values)
      navigate('/dashboard/short-courses')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RegistryForm
      backTo="/dashboard/short-courses"
      errorMessage={errorMessage}
      fields={shortCourseColumns}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      selectOptions={selectOptions}
      submitLabel="Save Short Course"
      subtitle="Capture delivery, participants, certification and revenue details."
      title="Add Short Course"
    />
  )
}

export default ShortCourseFormPage
