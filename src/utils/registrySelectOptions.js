import {
  listAccreditationBodies,
  listBeneficiaryTypes,
  listCertificationTypes,
  listCourseCategories,
  listDeliveryModes,
  listDepartments,
  listDonors,
  listFundingTypes,
  listSectors,
  listStaff,
} from '../services/registryService'
import { staticOptions, toOptions } from './registryOptions'

const ID_KEYS = (key) => [key, 'id', 'value']

const staffOptions = (staff) =>
  toOptions(staff, ['full_name', 'name'], ID_KEYS('staff_id'))

const departmentOptions = (departments) =>
  toOptions(departments, ['department_name', 'name'], ID_KEYS('department_id'))

// A failed lookup leaves that one dropdown empty instead of breaking the form.
const safely = (request) => request.catch(() => [])

/** Dropdown options for the project add/edit forms, straight from the lookup tables. */
export async function loadProjectSelectOptions(accessToken) {
  const [departments, donors, fundingTypes, sectors, staff, beneficiaryTypes] =
    await Promise.all([
      safely(listDepartments(accessToken)),
      safely(listDonors(accessToken)),
      safely(listFundingTypes(accessToken)),
      safely(listSectors(accessToken)),
      safely(listStaff(accessToken)),
      safely(listBeneficiaryTypes(accessToken)),
    ])

  return {
    beneficiaryType: toOptions(
      beneficiaryTypes,
      ['type_name', 'name'],
      ID_KEYS('beneficiary_type_id'),
    ),
    coordinator: staffOptions(staff),
    departments: departmentOptions(departments),
    donor: toOptions(
      donors,
      ['donor_name', 'name', 'funding_agency'],
      ID_KEYS('donor_id'),
    ),
    fundingType: toOptions(fundingTypes, ['type_name', 'name'], ID_KEYS('funding_type_id')),
    sector: toOptions(sectors, ['sector_name', 'name'], ID_KEYS('sector_id')),
    status: staticOptions(['Pipeline', 'Active', 'Completed', 'Suspended', 'Cancelled']),
  }
}

/** Dropdown options for the short-course add/edit forms. */
export async function loadShortCourseSelectOptions(accessToken) {
  const [departments, categories, modes, staff, certifications, accreditationBodies] =
    await Promise.all([
      safely(listDepartments(accessToken)),
      safely(listCourseCategories(accessToken)),
      safely(listDeliveryModes(accessToken)),
      safely(listStaff(accessToken)),
      safely(listCertificationTypes(accessToken)),
      safely(listAccreditationBodies(accessToken)),
    ])

  return {
    accreditation: toOptions(
      accreditationBodies,
      ['body_name', 'name'],
      ID_KEYS('accreditation_body_id'),
    ),
    category: toOptions(categories, ['category_name', 'name'], ID_KEYS('category_id')),
    certification: toOptions(
      certifications,
      ['certification_name', 'name'],
      ID_KEYS('certification_id'),
    ),
    coordinator: staffOptions(staff),
    department: departmentOptions(departments),
    mode: toOptions(modes, ['mode_name', 'name'], ID_KEYS('delivery_mode_id')),
  }
}
