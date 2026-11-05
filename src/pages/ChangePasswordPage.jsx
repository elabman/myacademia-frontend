import { useState } from 'react'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { changePassword } from '../services/authService'
import { theme } from '../theme'
import { validateNewPassword } from '../utils/passwordRules'

function ChangePasswordPage() {
  const { auth } = useAuth()
  const [confirmation, setConfirmation] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')
    const problem = validateNewPassword(newPassword, confirmation)

    if (problem) {
      setErrorMessage(problem)
      return
    }

    if (newPassword === currentPassword) {
      setErrorMessage('The new password must be different from the current one.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await changePassword(auth.accessToken, currentPassword, newPassword)
      setSuccessMessage('Your password has been changed.')
      setConfirmation('')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className={`text-lg font-bold ${theme.classes.heading}`}>Change Password</h2>
        <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
          Account security
        </p>
      </div>

      <form
        className={`max-w-lg space-y-4 border-t-4 p-5 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}
        onSubmit={handleSubmit}
      >
        {errorMessage && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}>
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <PasswordInput
          autoComplete="current-password"
          disabled={isSubmitting}
          id="current-password"
          label="Current password"
          onChange={setCurrentPassword}
          placeholder="Enter your current password"
          value={currentPassword}
        />
        <PasswordInput
          autoComplete="new-password"
          disabled={isSubmitting}
          id="new-password"
          label="New password"
          onChange={setNewPassword}
          placeholder="At least 8 characters, with a number"
          value={newPassword}
        />
        <PasswordInput
          autoComplete="new-password"
          disabled={isSubmitting}
          id="confirm-password"
          label="Confirm new password"
          onChange={setConfirmation}
          placeholder="Repeat the new password"
          value={confirmation}
        />

        <button
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${theme.classes.primaryButton}`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving...' : 'Change password'}
        </button>
      </form>
    </section>
  )
}

export default ChangePasswordPage
