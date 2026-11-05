import { apiRequest, unwrapData } from './apiClient'

export async function loginUser(credentials) {
  const payload = await apiRequest('/auth/login', {
    body: credentials,
    method: 'POST',
  })

  return unwrapData(payload)
}

export async function getCurrentUser(accessToken) {
  const payload = await apiRequest('/auth/me', {
    accessToken,
    method: 'GET',
  })

  return unwrapData(payload)
}

export async function logoutUser(accessToken) {
  if (!accessToken) {
    return
  }

  await apiRequest('/auth/logout', {
    accessToken,
    method: 'POST',
  })
}

export async function changePassword(accessToken, currentPassword, newPassword) {
  const payload = await apiRequest('/auth/change-password', {
    accessToken,
    body: { currentPassword, newPassword },
    method: 'POST',
  })

  return payload?.message
}
