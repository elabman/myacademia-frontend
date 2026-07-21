import { useCallback, useEffect, useState } from 'react'
import RegistryTable from '../components/RegistryTable'
import { shortCourseColumns } from '../data/registryData'
import { useAuth } from '../hooks/useAuth'
import { deleteShortCourse, listShortCourses } from '../services/registryService'

function ShortCoursesPage() {
  const { auth } = useAuth()
  const [deletingId, setDeletingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
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
      rows={shortCourses}
      title="Short Courses Registry"
    />
  )
}

export default ShortCoursesPage
