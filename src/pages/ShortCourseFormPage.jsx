import RegistryForm from '../components/RegistryForm'
import { shortCourseColumns } from '../data/registryData'

function ShortCourseFormPage() {
  return (
    <RegistryForm
      backTo="/dashboard/short-courses"
      fields={shortCourseColumns}
      title="Add Short Course"
    />
  )
}

export default ShortCourseFormPage
