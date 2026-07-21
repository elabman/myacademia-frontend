import { useCallback } from 'react'
import ApiListPage from '../components/ApiListPage'
import { listAuditLog } from '../services/registryService'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'table_name', label: 'Table' },
  { key: 'record_id', label: 'Record ID' },
  { key: 'action', label: 'Action' },
  { key: 'user_id', label: 'User ID' },
  { key: 'created_at', label: 'Created At' },
]

function AuditLogPage() {
  const loadData = useCallback((accessToken) => listAuditLog(accessToken), [])

  return (
    <ApiListPage
      backTo="/dashboard/admin"
      columns={columns}
      emptyMessage="No audit log entries were returned by the API."
      eyebrow="System History"
      loadData={loadData}
      title="Audit Log"
    />
  )
}

export default AuditLogPage
