import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RegistryForm from '../components/RegistryForm'
import { shortCourseColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { getShortCourse, updateShortCourse } from '../services/registryService'
import { theme } from '../theme'
import { loadShortCourseSelectOptions } from '../utils/registrySelectOptions'

function ShortCourseEditPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [initialValues, setInitialValues] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectOptions, setSelectOptions] = useState({})

  const loadPageData = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const [course, options] = await Promise.all([
        getShortCourse(auth.accessToken, courseId),
        loadShortCourseSelectOptions(auth.accessToken),
      ])

      setInitialValues(toShortCourseInitialValues(course, options))
      setSelectOptions(options)
    } catch (error) {
      setErrorMessage(error.message)
      setInitialValues(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, courseId])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadPageData, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadPageData])

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await updateShortCourse(auth.accessToken, courseId, values)
      navigate(`/dashboard/short-courses/${courseId}`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <FormState title="Loading short course" message="Preparing the edit form." />
    )
  }

  if (!initialValues) {
    return (
      <FormState
        title="Could not load short course"
        message={errorMessage || 'The selected short course could not be found.'}
      />
    )
  }

  return (
    <RegistryForm
      backTo={`/dashboard/short-courses/${courseId}`}
      errorMessage={errorMessage}
      fields={shortCourseColumns}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      selectOptions={selectOptions}
      submitLabel="Update Short Course"
      subtitle="Update delivery, participants, certification and revenue details."
      title="Edit Short Course"
    />
  )
}

function toShortCourseInitialValues(course, options) {
  return {
    ...course,
    category: course.categoryId || valueFromLabel(options.category, course.category),
    department: course.departmentId || valueFromLabel(options.department, course.department),
    mode: course.deliveryModeId || valueFromLabel(options.mode, course.mode),
    coordinator:
      course.coordinatorId || valueFromLabel(options.coordinator, course.coordinator),
    certification:
      course.certificationId ||
      valueFromLabel(options.certification, course.certification),
    accreditation:
      course.accreditationBodyId ||
      valueFromLabel(options.accreditation, course.accreditation),
    certified: numericValue(course.certified),
    days: numericValue(course.days),
    fee: numericValue(course.fee),
    female: numericValue(course.female),
    hours: numericValue(course.hours),
    male: numericValue(course.male),
    revenue: numericValue(course.revenue),
    total: numericValue(course.total),
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

export default ShortCourseEditPage
