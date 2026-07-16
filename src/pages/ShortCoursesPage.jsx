import RegistryTable from '../components/RegistryTable'
import { shortCourseColumns, shortCourses } from '../data/registryData'

function ShortCoursesPage() {
  return (
    <RegistryTable
      addTo="/dashboard/short-courses/new"
      columns={shortCourseColumns}
      eyebrow="Academic Year 2022/2023"
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
