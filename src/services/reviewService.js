import { apiRequest, createQueryString, unwrapData, unwrapList } from './apiClient'
import {
  mockDeleteService,
  mockListReviews,
  mockListServices,
  mockReviewTarget,
  mockSaveService,
  mockSubmitReview,
  shouldUseMock,
} from './reviewMock'

// Uses the demo data from reviewMock.js when the backend is missing or down
// (dev server, or VITE_REVIEWS_MOCK=true).
async function withMockFallback(request, mock) {
  try {
    return await request()
  } catch (error) {
    if (shouldUseMock(error)) {
      return mock()
    }

    throw error
  }
}

// Public endpoints: no access token, called from the mobile review screen.
export function getReviewTarget(staffId) {
  return withMockFallback(
    async () => unwrapData(await apiRequest(`/public/reviews/staff/${staffId}`)),
    () => mockReviewTarget(staffId),
  )
}

export function submitReview(data) {
  return withMockFallback(
    async () =>
      unwrapData(
        await apiRequest('/public/reviews', {
          body: data,
          method: 'POST',
        }),
      ),
    () => mockSubmitReview(data),
  )
}

// Admin endpoints.
export function listReviews(accessToken, params = {}) {
  return withMockFallback(
    async () =>
      unwrapList(
        await apiRequest(`/reviews${createQueryString(params)}`, { accessToken }),
      ),
    mockListReviews,
  )
}

// A service belongs to many departments. The API returns `departments`
// ([{department_id, department_name}]) and accepts `department_ids` on create/update.
export async function listServices(accessToken) {
  const services = await withMockFallback(
    async () => unwrapList(await apiRequest('/services', { accessToken })),
    mockListServices,
  )

  return services.map((service) => {
    const departments = service.departments ?? []

    return {
      ...service,
      department_ids:
        service.department_ids ??
        departments.map((department) => department.department_id ?? department.id),
      department_names:
        service.department_names ??
        departments
          .map((department) => department.department_name ?? department.name)
          .join(', '),
    }
  })
}

export function createService(accessToken, data) {
  return withMockFallback(
    async () =>
      unwrapData(
        await apiRequest('/services', { accessToken, body: data, method: 'POST' }),
      ),
    () => mockSaveService(data),
  )
}

export function updateService(accessToken, serviceId, data) {
  return withMockFallback(
    async () =>
      unwrapData(
        await apiRequest(`/services/${serviceId}`, {
          accessToken,
          body: data,
          method: 'PUT',
        }),
      ),
    () => mockSaveService(data, serviceId),
  )
}

export function deleteService(accessToken, serviceId) {
  return withMockFallback(
    () => apiRequest(`/services/${serviceId}`, { accessToken, method: 'DELETE' }),
    () => mockDeleteService(serviceId),
  )
}
