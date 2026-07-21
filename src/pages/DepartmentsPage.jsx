import MasterDataPage from '../components/MasterDataPage'
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment,
} from '../services/registryService'

const columns = [
  { key: 'department_name', label: 'Department' },
  { key: 'department_code', label: 'Code' },
]

const fields = [
  { name: 'department_name', label: 'Department Name', required: true },
  { name: 'department_code', label: 'Department Code' },
]

function DepartmentsPage() {
  return (
    <MasterDataPage
      backTo="/dashboard/admin"
      columns={columns}
      createRecord={createDepartment}
      deleteRecord={deleteDepartment}
      emptyMessage="No departments were returned by the API."
      eyebrow="Academic Structure"
      fields={fields}
      idKeys={['department_id', 'id']}
      listRecords={listDepartments}
      title="Departments"
      updateRecord={updateDepartment}
    />
  )
}

export default DepartmentsPage
