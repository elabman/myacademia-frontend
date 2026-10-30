import { apiRequest, createQueryString, unwrapData, unwrapList, unwrapMeta } from './apiClient'

export async function listProjects(accessToken, params = {}) {
  const payload = await apiRequest(`/projects${createQueryString(params)}`, {
    accessToken,
  })

  return {
    meta: unwrapMeta(payload),
    rows: unwrapList(payload).map(normalizeProject),
  }
}

export async function listProjectRecords(accessToken, params = {}) {
  const payload = await apiRequest(`/projects${createQueryString(params)}`, {
    accessToken,
  })

  return unwrapList(payload)
}

export async function getProject(accessToken, projectId) {
  try {
    const payload = await apiRequest(`/projects/${projectId}/full`, { accessToken })
    return normalizeProject(unwrapData(payload))
  } catch {
    const payload = await apiRequest(`/projects/${projectId}`, { accessToken })
    return normalizeProject(unwrapData(payload))
  }
}

export async function createProject(accessToken, formData) {
  const payload = await apiRequest('/projects', {
    accessToken,
    body: toProjectPayload(formData),
    method: 'POST',
  })

  const createdProject = unwrapData(payload)
  const projectId = createdProject?.id ?? createdProject?.project_id

  if (projectId && formData.departments) {
    await linkProjectDepartment(accessToken, projectId, formData.departments)
  }

  return createdProject
}

export async function updateProject(accessToken, projectId, formData) {
  const payload = await apiRequest(`/projects/${projectId}`, {
    accessToken,
    body: toProjectPayload(formData),
    method: 'PUT',
  })

  return unwrapData(payload)
}

export async function deleteProject(accessToken, projectId) {
  return apiRequest(`/projects/${projectId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listProjectDepartments(accessToken, projectId) {
  return unwrapList(
    await apiRequest(`/projects/${projectId}/departments`, { accessToken }),
  )
}

export async function linkProjectDepartment(accessToken, projectId, departmentId) {
  return apiRequest(`/projects/${projectId}/departments`, {
    accessToken,
    body: { department_id: Number(departmentId) },
    method: 'POST',
  })
}

export async function unlinkProjectDepartment(accessToken, projectId, departmentId) {
  return apiRequest(`/projects/${projectId}/departments/${departmentId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listProjectPartners(accessToken, projectId) {
  return unwrapList(
    await apiRequest(`/projects/${projectId}/partners`, { accessToken }),
  )
}

export async function linkProjectPartner(accessToken, projectId, partnerId) {
  return apiRequest(`/projects/${projectId}/partners`, {
    accessToken,
    body: { partner_id: Number(partnerId) },
    method: 'POST',
  })
}

export async function unlinkProjectPartner(accessToken, projectId, partnerId) {
  return apiRequest(`/projects/${projectId}/partners/${partnerId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function getProjectsSummary(accessToken) {
  return unwrapData(await apiRequest('/projects/summary', { accessToken }))
}

export async function listShortCourses(accessToken, params = {}) {
  const payload = await apiRequest(`/short-courses${createQueryString(params)}`, {
    accessToken,
  })

  return {
    meta: unwrapMeta(payload),
    rows: unwrapList(payload).map(normalizeShortCourse),
  }
}

export async function listShortCourseRecords(accessToken, params = {}) {
  const payload = await apiRequest(`/short-courses${createQueryString(params)}`, {
    accessToken,
  })

  return unwrapList(payload)
}

export async function getShortCourse(accessToken, courseId) {
  const payload = await apiRequest(`/short-courses/${courseId}`, { accessToken })
  return normalizeShortCourse(unwrapData(payload))
}

export async function createShortCourse(accessToken, formData) {
  const payload = await apiRequest('/short-courses', {
    accessToken,
    body: toShortCoursePayload(formData),
    method: 'POST',
  })

  return unwrapData(payload)
}

export async function updateShortCourse(accessToken, courseId, formData) {
  const payload = await apiRequest(`/short-courses/${courseId}`, {
    accessToken,
    body: toShortCoursePayload(formData),
    method: 'PUT',
  })

  return unwrapData(payload)
}

export async function deleteShortCourse(accessToken, courseId) {
  return apiRequest(`/short-courses/${courseId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function getShortCoursesSummary(accessToken) {
  return unwrapData(await apiRequest('/short-courses/summary', { accessToken }))
}

export async function listMouAgreements(accessToken, params = {}) {
  const payload = await apiRequest(
    `/mou-agreements${createQueryString(params)}`,
    { accessToken },
  )

  return {
    meta: unwrapMeta(payload),
    rows: unwrapList(payload).map(normalizeMouAgreement),
  }
}

export async function getMouAgreementsSummary(accessToken) {
  return unwrapData(await apiRequest('/mou-agreements/summary', { accessToken }))
}

export async function listExpiringMouAgreements(accessToken, days = 90) {
  return unwrapList(
    await apiRequest(`/mou-agreements/expiring?days=${days}`, { accessToken }),
  ).map(normalizeMouAgreement)
}

export async function getMouAgreement(accessToken, mouId) {
  try {
    const payload = await apiRequest(`/mou-agreements/${mouId}/full`, {
      accessToken,
    })
    return normalizeMouAgreement(unwrapData(payload))
  } catch {
    const payload = await apiRequest(`/mou-agreements/${mouId}`, { accessToken })
    return normalizeMouAgreement(unwrapData(payload))
  }
}

export async function createMouAgreement(accessToken, formData) {
  const payload = await apiRequest('/mou-agreements', {
    accessToken,
    body: toMouAgreementPayload(formData),
    method: 'POST',
  })

  const createdMou = unwrapData(payload)
  const mouId = createdMou?.id ?? createdMou?.mou_agreement_id

  if (mouId && formData.collaborationArea) {
    await linkMouCollaborationArea(accessToken, mouId, formData.collaborationArea)
  }

  return createdMou
}

export async function updateMouAgreement(accessToken, mouId, formData) {
  const payload = await apiRequest(`/mou-agreements/${mouId}`, {
    accessToken,
    body: toMouAgreementPayload(formData),
    method: 'PUT',
  })

  if (formData.collaborationArea) {
    await linkMouCollaborationArea(accessToken, mouId, formData.collaborationArea)
  }

  return unwrapData(payload)
}

export async function deleteMouAgreement(accessToken, mouId) {
  return apiRequest(`/mou-agreements/${mouId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listMouCollaborationAreas(accessToken, mouId) {
  return unwrapList(
    await apiRequest(`/mou-agreements/${mouId}/collaboration-areas`, {
      accessToken,
    }),
  )
}

export async function linkMouCollaborationArea(
  accessToken,
  mouId,
  collaborationAreaId,
) {
  return apiRequest(`/mou-agreements/${mouId}/collaboration-areas`, {
    accessToken,
    body: { collaboration_area_id: Number(collaborationAreaId) },
    method: 'POST',
  })
}

export async function unlinkMouCollaborationArea(
  accessToken,
  mouId,
  collaborationAreaId,
) {
  return apiRequest(
    `/mou-agreements/${mouId}/collaboration-areas/${collaborationAreaId}`,
    {
      accessToken,
      method: 'DELETE',
    },
  )
}

export async function listDepartments(accessToken) {
  return unwrapList(
    await apiRequest(`/departments${createQueryString({ limit: 100 })}`, { accessToken }),
  )
}

export async function createDepartment(accessToken, data) {
  return unwrapData(
    await apiRequest('/departments', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

export async function updateDepartment(accessToken, departmentId, data) {
  return unwrapData(
    await apiRequest(`/departments/${departmentId}`, {
      accessToken,
      body: data,
      method: 'PUT',
    }),
  )
}

export async function deleteDepartment(accessToken, departmentId) {
  return apiRequest(`/departments/${departmentId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listDonors(accessToken) {
  return unwrapList(await apiRequest('/donors', { accessToken }))
}

export async function listPartners(accessToken) {
  try {
    return unwrapList(await apiRequest('/partners', { accessToken })).map(
      normalizePartner,
    )
  } catch {
    return (await listDonors(accessToken)).map(normalizePartner)
  }
}

export async function createPartner(accessToken, data) {
  try {
    return unwrapData(
      await apiRequest('/partners', {
        accessToken,
        body: data,
        method: 'POST',
      }),
    )
  } catch {
    return createDonor(accessToken, { donor_name: data.partner_name })
  }
}

export async function updatePartner(accessToken, partnerId, data) {
  try {
    return unwrapData(
      await apiRequest(`/partners/${partnerId}`, {
        accessToken,
        body: data,
        method: 'PUT',
      }),
    )
  } catch {
    return updateDonor(accessToken, partnerId, { donor_name: data.partner_name })
  }
}

export async function deletePartner(accessToken, partnerId) {
  try {
    return await apiRequest(`/partners/${partnerId}`, {
      accessToken,
      method: 'DELETE',
    })
  } catch {
    return deleteDonor(accessToken, partnerId)
  }
}

function normalizePartner(partner) {
  return {
    ...partner,
    id: value(partner, ['partner_id', 'id', 'donor_id']),
    partner_name: value(partner, ['partner_name', 'donor_name', 'name']),
  }
}

export async function createDonor(accessToken, data) {
  return unwrapData(
    await apiRequest('/donors', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

export async function updateDonor(accessToken, donorId, data) {
  return unwrapData(
    await apiRequest(`/donors/${donorId}`, {
      accessToken,
      body: data,
      method: 'PUT',
    }),
  )
}

export async function deleteDonor(accessToken, donorId) {
  return apiRequest(`/donors/${donorId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listSectors(accessToken) {
  return unwrapList(await apiRequest('/sectors', { accessToken }))
}

export async function createSector(accessToken, data) {
  return unwrapData(
    await apiRequest('/sectors', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

export async function updateSector(accessToken, sectorId, data) {
  return unwrapData(
    await apiRequest(`/sectors/${sectorId}`, {
      accessToken,
      body: data,
      method: 'PUT',
    }),
  )
}

export async function deleteSector(accessToken, sectorId) {
  return apiRequest(`/sectors/${sectorId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listAcademicYears(accessToken) {
  return unwrapList(await apiRequest('/academic-years', { accessToken }))
}

export async function listPartnerTypes(accessToken) {
  return unwrapList(await apiRequest('/partner-types', { accessToken }))
}

export async function listCollaborationAreas(accessToken) {
  return unwrapList(await apiRequest('/collaboration-areas', { accessToken }))
}

export async function createAcademicYear(accessToken, data) {
  return unwrapData(
    await apiRequest('/academic-years', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

export async function updateAcademicYear(accessToken, academicYearId, data) {
  return unwrapData(
    await apiRequest(`/academic-years/${academicYearId}`, {
      accessToken,
      body: data,
      method: 'PUT',
    }),
  )
}

export async function deleteAcademicYear(accessToken, academicYearId) {
  return apiRequest(`/academic-years/${academicYearId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listUsers(accessToken, params = {}) {
  return unwrapList(
    await apiRequest(`/users${createQueryString(params)}`, { accessToken }),
  )
}

export async function createUser(accessToken, data) {
  return unwrapData(
    await apiRequest('/auth/register', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

export async function getUser(accessToken, userId) {
  return unwrapData(await apiRequest(`/users/${userId}`, { accessToken }))
}

export async function updateUser(accessToken, userId, data) {
  return unwrapData(
    await apiRequest(`/users/${userId}`, {
      accessToken,
      body: data,
      method: 'PUT',
    }),
  )
}

export async function deleteUser(accessToken, userId) {
  return apiRequest(`/users/${userId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listRoles(accessToken) {
  return unwrapList(await apiRequest('/roles', { accessToken }))
}

export async function listStaff(accessToken) {
  return unwrapList(
    await apiRequest(`/staff${createQueryString({ limit: 100 })}`, { accessToken }),
  )
}

export async function createStaff(accessToken, data) {
  return unwrapData(
    await apiRequest('/staff', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

export async function updateStaff(accessToken, staffId, data) {
  return unwrapData(
    await apiRequest(`/staff/${staffId}`, {
      accessToken,
      body: data,
      method: 'PUT',
    }),
  )
}

export async function deleteStaff(accessToken, staffId) {
  return apiRequest(`/staff/${staffId}`, {
    accessToken,
    method: 'DELETE',
  })
}

export async function listApprovals(accessToken, params = {}) {
  return unwrapList(
    await apiRequest(`/approvals${createQueryString(params)}`, { accessToken }),
  )
}

export async function createApproval(accessToken, data) {
  return unwrapData(
    await apiRequest('/approvals', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

export async function recordApprovalDecision(accessToken, approvalId, data) {
  return unwrapData(
    await apiRequest(`/approvals/${approvalId}`, {
      accessToken,
      body: data,
      method: 'PUT',
    }),
  )
}

export async function listAuditLog(accessToken, params = {}) {
  return unwrapList(
    await apiRequest(`/audit-log${createQueryString(params)}`, { accessToken }),
  )
}

export async function uploadFile(accessToken, file) {
  const data = new FormData()
  data.append('file', file)

  return unwrapData(
    await apiRequest('/uploads', {
      accessToken,
      body: data,
      method: 'POST',
    }),
  )
}

function normalizeProject(project) {
  return {
    id: value(project, ['id', 'project_id', 'sn']),
    sn: value(project, ['sn', 'serial_number', 'id', 'project_id']),
    createdAt: optionalValue(project, ['createdAt', 'created_at', 'created_date']),
    title: value(project, ['title', 'project_title']),
    departmentId: optionalValue(project, ['department_id', 'target_department_id']),
    donorId: optionalValue(project, ['donor_id']),
    fundingTypeId: optionalValue(project, ['funding_type_id']),
    sectorId: optionalValue(project, ['sector_id']),
    donor: value(project, ['donor', 'donor_name', 'funding_agency', 'donor_id']),
    partners: listValue(project, ['partners', 'partner_organisations', 'partner_organizations']),
    fundingType: value(project, ['fundingType', 'funding_type', 'funding_type_name', 'funding_type_id']),
    sector: value(project, ['sector', 'sector_name', 'sector_theme', 'sector_id']),
    departments: listValue(project, ['departments', 'target_departments']),
    coordinator: value(project, ['coordinator', 'project_coordinator', 'coordinator_name']),
    startDate: formatDate(value(project, ['startDate', 'start_date'])),
    endDate: formatDate(value(project, ['endDate', 'end_date'])),
    duration: value(project, ['duration', 'duration_months']),
    budgetUsd: money(value(project, ['budgetUsd', 'total_budget_usd'])),
    budgetRwf: money(value(project, ['budgetRwf', 'total_budget_rwf'])),
    collegeContribution: money(value(project, ['collegeContribution', 'college_rp_contribution_rwf'])),
    donorContribution: money(value(project, ['donorContribution', 'donor_contribution_usd'])),
    scope: value(project, ['scope', 'geographic_scope']),
    beneficiaryType: value(project, ['beneficiaryType', 'beneficiary_type']),
    beneficiaries: value(project, ['beneficiaries', 'direct_beneficiaries', 'no_direct_beneficiaries']),
    kpi: value(project, ['kpi', 'key_performance_indicator']),
    achievement: value(project, ['achievement', 'achievement_rate_pct', 'achievement_rate']),
    remarks: value(project, ['remarks', 'constraints', 'remarks_constraints']),
    status: value(project, ['status', 'overall_status']),
  }
}

function normalizeShortCourse(course) {
  return {
    id: value(course, ['id', 'short_course_id', 'sn']),
    sn: value(course, ['sn', 'serial_number', 'id', 'short_course_id']),
    createdAt: optionalValue(course, ['createdAt', 'created_at', 'created_date']),
    title: value(course, ['title', 'course_title']),
    categoryId: optionalValue(course, ['category_id']),
    deliveryModeId: optionalValue(course, ['delivery_mode_id']),
    departmentId: optionalValue(course, ['department_id']),
    department: value(course, ['department', 'department_name', 'department_id']),
    category: value(course, ['category', 'category_name', 'category_id']),
    days: value(course, ['days', 'duration_days']),
    hours: value(course, ['hours', 'duration_hours']),
    level: value(course, ['level']),
    mode: value(course, ['mode', 'delivery_mode', 'delivery_mode_name', 'delivery_mode_id']),
    language: value(course, ['language']),
    audience: value(course, ['audience', 'target_audience']),
    prerequisites: value(course, ['prerequisites']),
    coordinator: value(course, ['coordinator', 'course_coordinator', 'coordinator_name']),
    certification: value(course, ['certification', 'certification_awarded']),
    accreditation: value(course, ['accreditation', 'accreditation_body']),
    female: value(course, ['female', 'participants_female']),
    male: value(course, ['male', 'participants_male']),
    total: value(course, ['total', 'total_participants']),
    certified: value(course, ['certified', 'total_certified']),
    fee: money(value(course, ['fee', 'fee_per_participant'])),
    revenue: money(value(course, ['revenue', 'expected_revenue'])),
    status: value(course, ['status']),
  }
}

function normalizeMouAgreement(mou) {
  return {
    id: value(mou, ['id', 'mou_id', 'mou_agreement_id', 'agreement_id']),
    sn: value(mou, ['sn', 'serial_number', 'id', 'mou_id', 'mou_agreement_id']),
    createdAt: optionalValue(mou, ['createdAt', 'created_at', 'created_date']),
    partner: value(mou, ['partner', 'partner_name', 'donor_name', 'partner_id']),
    partnerId: optionalValue(mou, ['partner_id']),
    partnerType: value(mou, ['partner_type', 'partner_type_name', 'type_name', 'partner_type_id']),
    partnerTypeId: optionalValue(mou, ['partner_type_id']),
    country: value(mou, ['country']),
    contactPerson: value(mou, ['contactPerson', 'contact_person']),
    contactPosition: value(mou, ['contactPosition', 'contact_position']),
    contactEmail: value(mou, ['contactEmail', 'contact_email']),
    contactPhone: value(mou, ['contactPhone', 'contact_phone']),
    dateSigned: formatDate(value(mou, ['dateSigned', 'date_signed'])),
    effectiveDate: formatDate(value(mou, ['effectiveDate', 'effective_date'])),
    expiryDate: formatDate(value(mou, ['expiryDate', 'expiry_date'])),
    durationLabel: value(mou, ['durationLabel', 'duration_label']),
    objectives: value(mou, ['objectives', 'purpose_objectives']),
    department: value(mou, [
      'department',
      'department_name',
      'responsible_department',
      'responsible_department_id',
    ]),
    departmentId: optionalValue(mou, ['responsible_department_id', 'department_id']),
    status: value(mou, ['status']),
    renewalRequired: booleanLabel(value(mou, ['renewalRequired', 'renewal_required'])),
    lastReviewDate: formatDate(value(mou, ['lastReviewDate', 'last_review_date'])),
    deliverables: value(mou, ['deliverables', 'key_deliverables']),
    progressStatus: value(mou, ['progressStatus', 'progress_status']),
    nextAction: value(mou, ['nextAction', 'next_action']),
    collaborationArea: listValue(mou, [
      'collaborationArea',
      'collaboration_area',
      'collaboration_areas',
    ]),
    collaborationAreaId: optionalValue(mou, ['collaboration_area_id']),
  }
}

function toProjectPayload(formData) {
  return removeBlank({
    project_title: formData.title,
    donor_id: numberOrValue(formData.donor),
    funding_type_id: numberOrValue(formData.fundingType),
    sector_id: numberOrValue(formData.sector),
    project_coordinator: formData.coordinator,
    start_date: formData.startDate,
    end_date: formData.endDate,
    duration_months: numberOrValue(formData.duration),
    total_budget_usd: numberOrValue(formData.budgetUsd),
    total_budget_rwf: numberOrValue(formData.budgetRwf),
    college_rp_contribution_rwf: numberOrValue(formData.collegeContribution),
    donor_contribution_usd: numberOrValue(formData.donorContribution),
    geographic_scope: formData.scope,
    beneficiary_type: formData.beneficiaryType,
    direct_beneficiaries: numberOrValue(formData.beneficiaries),
    key_performance_indicator: formData.kpi,
    achievement_rate_pct: numberOrValue(formData.achievement),
    remarks_constraints: formData.remarks,
    overall_status: formData.status,
  })
}

function toShortCoursePayload(formData) {
  return removeBlank({
    course_title: formData.title,
    department_id: numberOrValue(formData.department),
    category_id: numberOrValue(formData.category),
    duration_days: numberOrValue(formData.days),
    duration_hours: numberOrValue(formData.hours),
    level: formData.level,
    delivery_mode_id: numberOrValue(formData.mode),
    language: formData.language,
    target_audience: formData.audience,
    prerequisites: formData.prerequisites,
    course_coordinator: formData.coordinator,
    certification_awarded: formData.certification,
    accreditation_body: formData.accreditation,
    participants_female: numberOrValue(formData.female),
    participants_male: numberOrValue(formData.male),
    total_participants: numberOrValue(formData.total),
    total_certified: numberOrValue(formData.certified),
    fee_per_participant: numberOrValue(formData.fee),
    expected_revenue: numberOrValue(formData.revenue),
    status: formData.status,
  })
}

function toMouAgreementPayload(formData) {
  return removeBlank({
    partner_id: numberOrValue(formData.partner),
    partner_type_id: numberOrValue(formData.partnerType),
    country: formData.country,
    contact_person: formData.contactPerson,
    contact_position: formData.contactPosition,
    contact_email: formData.contactEmail,
    contact_phone: formData.contactPhone,
    date_signed: formData.dateSigned,
    effective_date: formData.effectiveDate,
    expiry_date: formData.expiryDate,
    duration_label: formData.durationLabel,
    purpose_objectives: formData.objectives,
    responsible_department_id: numberOrValue(formData.department),
    status: formData.status,
    renewal_required: formData.renewalRequired,
    last_review_date: formData.lastReviewDate,
    key_deliverables: formData.deliverables,
    progress_status: formData.progressStatus,
    next_action: formData.nextAction,
  })
}

function value(source, keys) {
  const key = keys.find((item) => source?.[item] !== undefined && source?.[item] !== null)
  return key ? source[key] : '-'
}

function booleanLabel(valueToFormat) {
  if (valueToFormat === true || valueToFormat === 'true' || valueToFormat === 1) {
    return 'Yes'
  }

  if (valueToFormat === false || valueToFormat === 'false' || valueToFormat === 0) {
    return 'No'
  }

  return valueToFormat
}

function optionalValue(source, keys) {
  const key = keys.find((item) => source?.[item] !== undefined && source?.[item] !== null)
  return key ? source[key] : undefined
}

function listValue(source, keys) {
  const foundValue = value(source, keys)

  if (Array.isArray(foundValue)) {
    return foundValue
      .map(
        (item) =>
          item.name ||
          item.collaboration_area_name ||
          item.area_name ||
          item.department_name ||
          item.partner_name ||
          item.full_name ||
          item.title ||
          item,
      )
      .join(', ')
  }

  return foundValue
}

function formatDate(dateValue) {
  if (!dateValue || dateValue === '-') {
    return '-'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function money(amount) {
  if (amount === undefined || amount === null || amount === '') {
    return '-'
  }

  const numericAmount = Number(String(amount).replaceAll(',', ''))

  if (Number.isNaN(numericAmount)) {
    return amount
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

function numberOrValue(valueToConvert) {
  if (valueToConvert === undefined || valueToConvert === null || valueToConvert === '') {
    return undefined
  }

  const normalizedValue = String(valueToConvert).replaceAll(',', '').replace('%', '')
  const numericValue = Number(normalizedValue)

  return Number.isNaN(numericValue) ? valueToConvert : numericValue
}

function removeBlank(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, valueToKeep]) => valueToKeep !== undefined && valueToKeep !== ''),
  )
}
