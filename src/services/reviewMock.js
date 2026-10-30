// Demo data so the review screens work before the backend endpoints exist.
// Active in `npm run dev`, or in any build with VITE_REVIEWS_MOCK=true.
// Services and reviews created while in demo mode live in localStorage.

const STORAGE_KEY = 'myacademia.mockReviews'

export const mockDepartments = [
  { department_id: 1, department_name: 'Computer Science' },
  { department_id: 2, department_name: 'Engineering' },
  { department_id: 3, department_name: 'Business' },
]

export const mockStaff = [
  { staff_id: 1, full_name: 'Jane Doe', department_name: 'Computer Science' },
  { staff_id: 2, full_name: 'John Smith', department_name: 'Engineering' },
  { staff_id: 3, full_name: 'Aline Uwase', department_name: 'Business' },
]

const defaultServices = [
  { service_id: 1, name: 'Student Registration', description: null, department_ids: [1, 2, 3] },
  { service_id: 2, name: 'Transcript Request', description: null, department_ids: [1, 3] },
  { service_id: 3, name: 'Lab Access', description: 'Equipment and lab booking', department_ids: [1, 2] },
]

export function isMockEnabled() {
  return import.meta.env.DEV || import.meta.env.VITE_REVIEWS_MOCK === 'true'
}

// Only fall back when the backend is missing or down, never on validation errors.
export function shouldUseMock(error) {
  return (
    isMockEnabled() &&
    (!error.status || error.status === 404 || error.status >= 500)
  )
}

function readStore() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))

    if (stored) {
      return stored
    }
  } catch {
    // Fall through to defaults.
  }

  return { reviews: [], services: defaultServices }
}

function writeStore(store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Demo data just won't persist.
  }
}

function withDepartments(service) {
  const departments = mockDepartments.filter((department) =>
    service.department_ids.includes(department.department_id),
  )

  return {
    ...service,
    department_names: departments.map((d) => d.department_name).join(', '),
    departments,
  }
}

export function mockListServices() {
  return readStore().services.map(withDepartments)
}

export function mockSaveService(data, serviceId) {
  const store = readStore()
  const record = {
    description: null,
    department_ids: [],
    ...data,
    service_id: serviceId ? Number(serviceId) : Date.now(),
  }

  store.services = serviceId
    ? store.services.map((s) =>
        String(s.service_id) === String(serviceId) ? { ...s, ...record } : s,
      )
    : [...store.services, record]
  writeStore(store)

  return record
}

export function mockDeleteService(serviceId) {
  const store = readStore()

  store.services = store.services.filter(
    (service) => String(service.service_id) !== String(serviceId),
  )
  writeStore(store)
}

export function mockReviewTarget(staffId) {
  const staff =
    mockStaff.find((member) => String(member.staff_id) === String(staffId)) ??
    { staff_id: staffId, full_name: `Demo Staff #${staffId}`, department_name: 'Demo Department' }

  return { demo: true, staff, services: readStore().services }
}

export function mockSubmitReview(data) {
  const store = readStore()
  const staff = mockReviewTarget(data.staff_id).staff
  const service = store.services.find(
    (item) => String(item.service_id) === String(data.service_id),
  )
  const review = {
    ...data,
    created_at: new Date().toISOString(),
    review_id: Date.now(),
    service_name: service?.name,
    staff_name: staff.full_name,
  }

  store.reviews = [review, ...store.reviews]
  writeStore(store)

  return review
}

export function mockListReviews() {
  return readStore().reviews
}
