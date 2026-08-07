import MasterDataPage from '../components/MasterDataPage'
import {
  createDonor,
  deleteDonor,
  listDonors,
  updateDonor,
} from '../services/registryService'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'donor_name', label: 'Partner' },
  { key: 'name', label: 'Name' },
]

const fields = [
  { name: 'donor_name', label: 'Partner Name', required: true },
]

function PatternerPage() {
  return (
    <MasterDataPage
      columns={columns}
      createRecord={createDonor}
      deleteRecord={deleteDonor}
      emptyMessage="No partners were returned by the API."
      eyebrow="Partner Organisations"
      fields={fields}
      idKeys={['id', 'donor_id']}
      listRecords={listDonors}
      title="Partners"
      updateRecord={updateDonor}
    />
  )
}

export default PatternerPage
