import { useCallback } from 'react'
import ApiListPage from '../components/ApiListPage'
import { listApprovals } from '../services/registryService'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'entity_type', label: 'Entity Type' },
  { key: 'entity_id', label: 'Entity ID' },
  { key: 'requested_by', label: 'Requested By' },
  { key: 'role_required', label: 'Role Required' },
  { key: 'decision', label: 'Decision' },
  { key: 'comments', label: 'Comments' },
]

function ApprovalsPage() {
  const loadData = useCallback(
    (accessToken) => listApprovals(accessToken, { decision: 'Pending' }),
    [],
  )

  return (
    <ApiListPage
      columns={columns}
      emptyMessage="There are no pending approvals."
      eyebrow="Approval Workflow"
      loadData={loadData}
      title="Approvals"
    />
  )
}

export default ApprovalsPage
