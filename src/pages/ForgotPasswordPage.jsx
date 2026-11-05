import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Logo from '../components/Logo'
import { requestPasswordReset } from '../services/authService'
import { theme } from '../theme'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await requestPasswordReset(email.trim())
      setIsSent(true)
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

      {isSent ? (
        <div className="space-y-4 text-center">
          <MailCheck className="mx-auto text-emerald-500" size={52} />
          <h2 className={`text-lg font-bold sm:text-2xl ${theme.classes.heading}`}>
            Check your email
          </h2>
          <p className={`text-sm ${theme.classes.muted}`}>
            If an account exists for <strong>{email}</strong>, we have sent a link to
            choose a new password. It expires soon, so use it right away. Check your
            spam folder if you do not see it.
          </p>
          <Link className={`inline-block text-sm font-medium ${theme.classes.link}`} to="/login">
            Back to log in
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 text-center sm:mb-8">
            <h2 className={`text-lg font-bold sm:text-2xl ${theme.classes.heading}`}>
              Forgot your password?
            </h2>
            <p className={`mt-2 text-xs sm:text-sm ${theme.classes.muted}`}>
              Enter the email of your account and we will send you a link to reset it.
            </p>
          </div>

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}>
                {errorMessage}
              </div>
            )}

            <div>
              <label
                className={`mb-1.5 block text-xs font-semibold sm:text-sm ${theme.classes.label}`}
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.classes.icon}`}
                  size={18}
                />
                <input
                  autoComplete="email"
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-2 sm:py-3 ${theme.classes.field}`}
                  disabled={isSubmitting}
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <button
              className={`w-full rounded-xl py-2.5 font-semibold shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:py-3 ${theme.classes.primaryButton}`}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <Link
            className={`mt-6 flex items-center justify-center gap-2 text-sm font-medium ${theme.classes.link}`}
            to="/login"
          >
            <ArrowLeft size={16} />
            Back to log in
          </Link>
        </>
      )}
    </AuthLayout>
  )
}

export default ForgotPasswordPage
