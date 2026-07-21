import MasterDataPage from '../components/MasterDataPage'
import {
  createAcademicYear,
  deleteAcademicYear,
  listAcademicYears,
  updateAcademicYear,
} from '../services/registryService'

const columns = [
  { key: 'year_label', label: 'Year' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
]

const fields = [
  { name: 'year_label', label: 'Year Label', required: true },
  { name: 'start_date', label: 'Start Date', type: 'date' },
  { name: 'end_date', label: 'End Date', type: 'date' },
]

function AcademicYearsPage() {
  return (
    <MasterDataPage
      backTo="/dashboard/admin"
      columns={columns}
      createRecord={createAcademicYear}
      deleteRecord={deleteAcademicYear}
      emptyMessage="No academic years were returned by the API."
      eyebrow="Academic Calendar"
      fields={fields}
      idKeys={['academic_year_id', 'id']}
      listRecords={listAcademicYears}
      title="Academic Years"
      updateRecord={updateAcademicYear}
    />
  )
}

export default AcademicYearsPage
