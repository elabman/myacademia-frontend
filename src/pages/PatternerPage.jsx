import MasterDataPage from '../components/MasterDataPage'
import {
  createPartner,
  deletePartner,
  listPartners,
  updatePartner,
} from '../services/registryService'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'partner_name', label: 'Partner Name' },
]

const fields = [
  { name: 'partner_name', label: 'Partner Name', required: true },
]

function PatternerPage() {
  return (
    <MasterDataPage
      columns={columns}
      createRecord={createPartner}
      deleteRecord={deletePartner}
      emptyMessage="No partners were returned by the API."
      eyebrow="Partner Organisations"
      fields={fields}
      idKeys={['partner_id', 'id', 'donor_id']}
      listRecords={listPartners}
      title="Partners"
      updateRecord={updatePartner}
    />
  )
}

export default PatternerPage
