import { apiRequest, createQueryString, unwrapData, unwrapList } from './apiClient'

// ---- admin ----
export async function listForms(accessToken, params = {}) {
  return unwrapList(await apiRequest(`/forms${createQueryString(params)}`, { accessToken }))
}

export async function listFormTemplates(accessToken) {
  return unwrapList(await apiRequest('/forms/templates', { accessToken }))
}

export async function getForm(accessToken, formId) {
  return unwrapData(await apiRequest(`/forms/${formId}`, { accessToken }))
}

export async function createForm(accessToken, body) {
  return unwrapData(await apiRequest('/forms', { accessToken, body, method: 'POST' }))
}

export async function saveForm(accessToken, formId, body) {
  return unwrapData(await apiRequest(`/forms/${formId}`, { accessToken, body, method: 'PUT' }))
}

const formAction = (action) => async (accessToken, formId) =>
  unwrapData(await apiRequest(`/forms/${formId}/${action}`, { accessToken, method: 'POST' }))

export const publishForm = formAction('publish')
export const closeForm = formAction('close')
export const unpublishForm = formAction('unpublish')

export async function deleteForm(accessToken, formId) {
  return apiRequest(`/forms/${formId}`, { accessToken, method: 'DELETE' })
}

export async function listFormResponses(accessToken, formId, params = {}) {
  return unwrapList(
    await apiRequest(`/forms/${formId}/responses${createQueryString(params)}`, { accessToken }),
  )
}

export async function deleteFormResponse(accessToken, formId, responseId) {
  return apiRequest(`/forms/${formId}/responses/${responseId}`, {
    accessToken,
    method: 'DELETE',
  })
}

// ---- public (no login) ----
export async function getPublicForm(slug) {
  return unwrapData(await apiRequest(`/public/forms/${slug}`))
}

export async function submitPublicForm(slug, answers) {
  const payload = await apiRequest(`/public/forms/${slug}/responses`, {
    body: { answers },
    method: 'POST',
  })

  return payload?.message
}
