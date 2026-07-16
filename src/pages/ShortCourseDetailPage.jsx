import { useParams } from 'react-router-dom'
import RegistryDetail from '../components/RegistryDetail'
import { shortCourseColumns, shortCourses } from '../data/registryData'

function ShortCourseDetailPage() {
  const { courseId } = useParams()
  const course = shortCourses.find((item) => String(item.sn) === courseId)

  return (
    <RegistryDetail
      backTo="/dashboard/short-courses"
      columns={shortCourseColumns}
      record={course}
      title="Short Course Details"
    />
  )
}

export default ShortCourseDetailPage
