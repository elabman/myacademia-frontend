import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Logo from '../components/Logo'
import PasswordInput from '../components/PasswordInput'
import { resetPassword } from '../services/authService'
import { theme } from '../theme'
import { validateNewPassword } from '../utils/passwordRules'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [confirmation, setConfirmation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDone, setIsDone] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const problem = validateNewPassword(password, confirmation)

    if (problem) {
      setErrorMessage(problem)
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await resetPassword(token, password)
      setIsDone(true)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-7 flex justify-center md:hidden">
        <Logo />
      </div>

      {isDone ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500" size={52} />
          <h2 className={`text-lg font-bold sm:text-2xl ${theme.classes.heading}`}>
            Password updated
          </h2>
          <p className={`text-sm ${theme.classes.muted}`}>
            You can now log in with your new password.
          </p>
          <Link
            className={`inline-block rounded-xl px-6 py-2.5 text-sm font-semibold shadow-lg ${theme.classes.primaryButton}`}
            to="/login"
          >
            Go to log in
          </Link>
        </div>
      ) : !token ? (
        <div className="space-y-4 text-center">
          <h2 className={`text-lg font-bold sm:text-2xl ${theme.classes.heading}`}>
            This link is not valid
          </h2>
          <p className={`text-sm ${theme.classes.muted}`}>
            The reset link is incomplete. Request a new one and use the link from the
            newest email.
          </p>
          <Link className={`inline-block text-sm font-medium ${theme.classes.link}`} to="/forgot-password">
            Request a new link
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 text-center sm:mb-8">
            <h2 className={`text-lg font-bold sm:text-2xl ${theme.classes.heading}`}>
              Choose a new password
            </h2>
            <p className={`mt-2 text-xs sm:text-sm ${theme.classes.muted}`}>
              Use at least 8 characters, including a number.
            </p>
          </div>

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}>
                {errorMessage}{' '}
                {/expired|invalid/i.test(errorMessage) && (
                  <Link className="font-semibold underline" to="/forgot-password">
                    Request a new link
                  </Link>
                )}
              </div>
            )}

            <PasswordInput
              autoComplete="new-password"
              disabled={isSubmitting}
              id="new-password"
              label="New password"
              onChange={setPassword}
              placeholder="Enter a new password"
              value={password}
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
              className={`w-full rounded-xl py-2.5 font-semibold shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:py-3 ${theme.classes.primaryButton}`}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Saving...' : 'Reset password'}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}

export default ResetPasswordPage
