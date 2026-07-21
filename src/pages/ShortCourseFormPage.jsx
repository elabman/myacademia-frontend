import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { shortCourseColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import {
  createShortCourse,
  listDepartments,
  listShortCourseRecords,
} from '../services/registryService'
import { toOptions } from '../utils/registryOptions'

function ShortCourseFormPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadSelectOptions = useCallback(async () => {
    const [departments, shortCourseRecords] = await Promise.all([
      listDepartments(auth.accessToken).catch(() => []),
      listShortCourseRecords(auth.accessToken, { limit: 1000, page: 1 }).catch(
        () => [],
      ),
    ])

    setSelectOptions({
      category: toOptions(
        shortCourseRecords,
        ['category_name', 'category'],
        ['category_id'],
      ),
      department: toOptions(
        departments,
        ['department_name', 'name'],
        ['department_id', 'id', 'value'],
      ),
      mode: toOptions(
        shortCourseRecords,
        ['delivery_mode_name', 'delivery_mode', 'mode'],
        ['delivery_mode_id'],
      ),
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
