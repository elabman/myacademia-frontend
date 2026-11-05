// Same rules as the API: at least 8 characters and at least one number.
export function validateNewPassword(password, confirmation) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number.'
  }

  if (password !== confirmation) {
    return 'The two passwords do not match.'
  }

  return ''
}
