import { ClipboardList } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RegistryTable from '../components/RegistryTable'
import { shortCourseColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { listForms } from '../services/formService'
import { deleteShortCourse, listShortCourses } from '../services/registryService'
import { formStates } from '../utils/formOptions'
import { theme } from '../theme'

function ShortCoursesPage() {
  const { auth } = useAuth()
  const [deletingId, setDeletingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  // { [short_course_id]: form } - null when this user may not see forms (the button is then hidden)
  const [formsByCourse, setFormsByCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shortCourses, setShortCourses] = useState([])

  const loadShortCourses = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await listShortCourses(auth.accessToken, {
        limit: 100,
        page: 1,
      })
      setShortCourses(result.rows)

      try {
        const forms = await listForms(auth.accessToken)
        setFormsByCourse(Object.fromEntries(forms.filter((form) => form.short_course_id).map((form) => [form.short_course_id, form])))
      } catch {
        setFormsByCourse(null)
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadShortCourses, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadShortCourses])

  const handleDeleteShortCourse = async (course) => {
    const courseId = course.id ?? course.sn

    if (!window.confirm(`Delete "${course.title}"?`)) {
      return
    }

    setErrorMessage('')
    setDeletingId(courseId)

    try {
      await deleteShortCourse(auth.accessToken, courseId)
      setShortCourses((currentCourses) =>
        currentCourses.filter((item) => String(item.id ?? item.sn) !== String(courseId)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const renderApplicationAction = (course) => {
    if (!formsByCourse) {
      return null
    }

    const courseId = course.courseId ?? course.id
    const form = formsByCourse[courseId]
    const state = form ? formStates[form.state] ?? formStates.draft : null

    return (
      <Link
        aria-label="Application form"
        className={`relative inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition ${theme.classes.tableToolbarButton}`}
        title={form ? `Application form: ${state.label}, ${form.response_count} applicant(s)` : 'Create the application form'}
        to={`/dashboard/short-courses/${courseId}/application`}
      >
        <ClipboardList size={15} />
        {form ? form.response_count : <span className="font-normal text-slate-500">Form</span>}
        {form && (
          <span
            className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white ${
              form.state === 'open' ? 'bg-emerald-500' : form.state === 'draft' ? 'bg-amber-400' : 'bg-slate-400'
            }`}
          />
        )}
      </Link>
    )
  }

  return (
    <RegistryTable
      addTo="/dashboard/short-courses/new"
      columns={shortCourseColumns}
      emptyMessage="No short courses have been added yet."
      errorMessage={errorMessage}
      eyebrow="Academic Year 2022/2023"
      isDeletingId={deletingId}
      isLoading={isLoading}
      onDeleteRow={handleDeleteShortCourse}
      onRefresh={loadShortCourses}
      quickColumns={[
        'sn',
        'title',
        'department',
        'category',
        'days',
        'hours',
        'mode',
        'total',
        'certified',
        'status',
      ]}
      rowActions={renderApplicationAction}
      rows={shortCourses}
      title="Short Courses Registry"
    />
  )
}

export default ShortCoursesPage
