import {
  listCollaborationAreas,
  listDepartments,
  listDonors,
  listPartnerTypes,
} from '../services/registryService'
import { staticOptions, toOptions } from './registryOptions'

export async function loadMouSelectOptions(accessToken) {
  const [partners, partnerTypes, departments, collaborationAreas] =
    await Promise.all([
      listDonors(accessToken).catch(() => []),
      listPartnerTypes(accessToken).catch(() => []),
      listDepartments(accessToken).catch(() => []),
      listCollaborationAreas(accessToken).catch(() => []),
    ])

  return {
    collaborationArea: toOptions(
      collaborationAreas,
      ['collaboration_area_name', 'area_name', 'name'],
      ['collaboration_area_id', 'id', 'value'],
    ),
    department: toOptions(
      departments,
      ['department_name', 'name'],
      ['department_id', 'id', 'value'],
    ),
    partner: toOptions(
      partners,
      ['partner_name', 'donor_name', 'name'],
      ['partner_id', 'donor_id', 'id', 'value'],
    ),
    partnerType: toOptions(
      partnerTypes,
      ['partner_type_name', 'type_name', 'name'],
      ['partner_type_id', 'id', 'value'],
    ),
    progressStatus: staticOptions([
      'Not Started',
      'On Track',
      'Delayed',
      'Completed',
    ]),
    renewalRequired: [
      { label: 'Yes', value: '1' },
      { label: 'No', value: '0' },
    ],
    status: staticOptions([
      'Active',
      'Expired',
      'Terminated',
      'Under Review',
      'Pending Signature',
    ]),
  }
}
