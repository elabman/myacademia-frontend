import MasterDataPage from '../components/MasterDataPage'
import {
  createDonor,
  deleteDonor,
  listDonors,
  updateDonor,
} from '../services/registryService'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'donor_name', label: 'Donor' },
  { key: 'name', label: 'Name' },
]

const fields = [
  { name: 'donor_name', label: 'Donor Name', required: true },
]

function DonorsPage() {
  return (
    <MasterDataPage
      columns={columns}
      createRecord={createDonor}
      deleteRecord={deleteDonor}
      emptyMessage="No donors were returned by the API."
      eyebrow="Funding Agencies"
      fields={fields}
      idKeys={['id', 'donor_id']}
      listRecords={listDonors}
      title="Donors"
      updateRecord={updateDonor}
    />
  )
}

export default DonorsPage
