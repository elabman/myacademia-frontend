import MasterDataPage from '../components/MasterDataPage'
import {
  createSector,
  deleteSector,
  listSectors,
  updateSector,
} from '../services/registryService'

const columns = [
  { key: 'sector_name', label: 'Sector' },
]

const fields = [
  { name: 'sector_name', label: 'Sector Name', required: true },
]

function SectorsPage() {
  return (
    <MasterDataPage
      backTo="/dashboard/admin"
      columns={columns}
      createRecord={createSector}
      deleteRecord={deleteSector}
      emptyMessage="No sectors were returned by the API."
      eyebrow="Project Themes"
      fields={fields}
      idKeys={['sector_id', 'id']}
      listRecords={listSectors}
      title="Sectors"
      updateRecord={updateSector}
    />
  )
}

export default SectorsPage
