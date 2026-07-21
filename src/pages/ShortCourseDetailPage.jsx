import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ShortCourseProfileDetail from '../components/ShortCourseProfileDetail'
import { useAuth } from '../hooks/useAuth'
import { deleteShortCourse, getShortCourse } from '../services/registryService'

function ShortCourseDetailPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadShortCourse = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      setCourse(await getShortCourse(auth.accessToken, courseId))
    } catch (error) {
      setErrorMessage(error.message)
      setCourse(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, courseId])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadShortCourse, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadShortCourse])

  const handleDelete = async () => {
    if (!course || !window.confirm(`Delete "${course.title}"?`)) {
      return
    }

    setErrorMessage('')
    setIsDeleting(true)

    try {
      await deleteShortCourse(auth.accessToken, courseId)
      navigate('/dashboard/short-courses')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ShortCourseProfileDetail
      backTo="/dashboard/short-courses"
      course={course}
      editTo={`/dashboard/short-courses/${courseId}/edit`}
      errorMessage={errorMessage}
      isDeleting={isDeleting}
      isLoading={isLoading}
      onDelete={course ? handleDelete : undefined}
    />
  )
}

export default ShortCourseDetailPage
