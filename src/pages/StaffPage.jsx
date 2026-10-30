import { useEffect, useMemo, useState } from 'react'
import MasterDataPage from '../components/MasterDataPage'
import { useAuth } from '../hooks/useAuth'
import {
  createStaff,
  deleteStaff,
  listDepartments,
  listStaff,
  updateStaff,
} from '../services/registryService'

const columns = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'department_name', label: 'Department' },
]

function StaffPage() {
  const { auth } = useAuth()
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    let isActive = true

    listDepartments(auth.accessToken)
      .then((rows) => isActive && setDepartments(rows))
      .catch(() => isActive && setDepartments([]))

    return () => {
      isActive = false
    }
  }, [auth.accessToken])

  const fields = useMemo(
    () => [
      { name: 'full_name', label: 'Full Name', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
      {
        name: 'department_id',
        label: 'Department',
        options: departments.map((department) => ({
          label: department.department_name,
          value: department.department_id ?? department.id,
        })),
        type: 'select',
      },
    ],
    [departments],
  )

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
