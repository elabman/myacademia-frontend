import { useEffect, useMemo, useState } from 'react'
import MasterDataPage from '../components/MasterDataPage'
import { useAuth } from '../hooks/useAuth'
import { listDepartments } from '../services/registryService'
import { mockDepartments, shouldUseMock } from '../services/reviewMock'
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '../services/reviewService'

const columns = [
  { key: 'name', label: 'Service' },
  { key: 'description', label: 'Description' },
  { key: 'department_names', label: 'Departments' },
]

function ServicesPage() {
  const { auth } = useAuth()
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    let isActive = true

    listDepartments(auth.accessToken)
      .then((rows) => isActive && setDepartments(rows))
      .catch((error) =>
        isActive && setDepartments(shouldUseMock(error) ? mockDepartments : []),
      )

    return () => {
      isActive = false
    }
  }, [auth.accessToken])

  const fields = useMemo(
    () => [
      { name: 'name', label: 'Service Name', required: true },
      { name: 'description', label: 'Description' },
      {
        name: 'department_ids',
        label: 'Departments',
        options: departments.map((department) => ({
          label: department.department_name,
          value: department.department_id ?? department.id,
        })),
        type: 'multiselect',
      },
    ],
    [departments],
  )

  return (
    <MasterDataPage
      backTo="/dashboard/admin"
      columns={columns}
      createRecord={createService}
      deleteRecord={deleteService}
      emptyMessage="No services have been created yet."
      eyebrow="Reviewable Services"
      fields={fields}
      idKeys={['service_id', 'id']}
      listRecords={listServices}
      title="Services"
      updateRecord={updateService}
    />
  )
}

export default ServicesPage
