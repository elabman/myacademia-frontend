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
  // Show who and which role by name; the API returns the *_name joins next to the ids.
  const loadData = useCallback(async (accessToken) => {
    const approvals = await listApprovals(accessToken, { decision: 'Pending' })

    return approvals.map((approval) => ({
      ...approval,
      requested_by: approval.requested_by_name ?? approval.requested_by,
      role_required: approval.role_required_name ?? approval.role_required,
    }))
  }, [])

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
