const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export async function apiRequest(path, options = {}) {
  const { accessToken, body, headers, ...requestOptions } = options
  const isFormData = body instanceof FormData
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      body: isFormData || body === undefined ? body : JSON.stringify(body),
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
    })
  } catch {
    throw new Error('Unable to reach the server. Please try again.')
  }

  const payload = await parseJson(response)

  if (!response.ok) {
    throw Object.assign(new Error(getErrorMessage(payload)), {
      status: response.status,
    })
  }

  return payload
}

export function createQueryString(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const value = query.toString()
  return value ? `?${value}` : ''
}

export function unwrapData(payload) {
  return payload?.data ?? payload
}

export function unwrapList(payload) {
  const data = unwrapData(payload)

  if (Array.isArray(data)) {
    return data
  }

  return (
    data?.items ??
    data?.rows ??
    data?.records ??
    data?.data ??
    payload?.items ??
    payload?.rows ??
    []
  )
}

export function unwrapMeta(payload) {
  const data = unwrapData(payload)

  return (
    data?.pagination ??
    data?.meta ??
    payload?.pagination ??
    payload?.meta ??
    {}
  )
}

async function parseJson(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function getErrorMessage(payload) {
  if (!payload) {
    return 'Something went wrong. Try again.'
  }

  if (typeof payload.message === 'string') {
    return payload.message
  }

  if (typeof payload.error === 'string') {
    return payload.error
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors
      .map((error) => error.message || error.msg || error)
      .filter(Boolean)
      .join(' ')
  }

  return 'Something went wrong. Try again.'
}
