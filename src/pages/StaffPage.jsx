import MasterDataPage from '../components/MasterDataPage'
import {
  createStaff,
  deleteStaff,
  listStaff,
  updateStaff,
} from '../services/registryService'

const columns = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'department_name', label: 'Department' },
]

const fields = [
  { name: 'full_name', label: 'Full Name', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'department_id', label: 'Department ID', type: 'number' },
]

function StaffPage() {
  return (
    <MasterDataPage
      backTo="/dashboard/admin"
      columns={columns}
      createRecord={createStaff}
      deleteRecord={deleteStaff}
      emptyMessage="No staff records were returned by the API."
      eyebrow="Staff Directory"
      fields={fields}
      idKeys={['staff_id', 'id']}
      listRecords={listStaff}
      title="Staff"
      updateRecord={updateStaff}
    />
  )
}

export default StaffPage
