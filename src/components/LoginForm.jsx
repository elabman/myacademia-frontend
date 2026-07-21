import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'
import { theme } from '../theme'

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await onLogin({ email, password, rememberMe })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col justify-center px-5 py-7 sm:p-10 lg:p-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-7 flex justify-center md:hidden">
          <Logo />
        </div>

        <div className="mb-5 text-center sm:mb-8">
          <h2 className={`text-lg font-bold sm:text-2xl ${theme.classes.heading}`}>
            Log in to MyAcademia
          </h2>
          {/* <p className={`mt-2 text-xs sm:text-sm ${theme.classes.muted}`}>
            Don&apos;t have an account?{' '}
            <a href="#" className={`font-medium ${theme.classes.link}`}>
              Sign up
            </a>
          </p> */}
        </div>

        <form
          className="space-y-4 sm:space-y-5"
          onSubmit={handleSubmit}
        >
          {errorMessage && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className={`mb-1.5 block text-xs font-semibold sm:text-sm ${theme.classes.label}`}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.classes.icon}`}
                size={18}
              />
              <input
                disabled={isSubmitting}
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-2 sm:py-3 ${theme.classes.field}`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className={`mb-1.5 block text-xs font-semibold sm:text-sm ${theme.classes.label}`}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.classes.icon}`}
                size={18}
              />
              <input
                disabled={isSubmitting}
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={`w-full rounded-xl border py-2.5 pl-11 pr-11 text-sm transition focus:outline-none focus:ring-2 sm:py-3 ${theme.classes.field}`}
              />
              <button
                disabled={isSubmitting}
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition ${theme.classes.icon} ${theme.classes.iconHover}`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs sm:text-sm min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                disabled={isSubmitting}
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className={`h-4 w-4 rounded ${theme.classes.checkbox}`}
              />
              <span className={theme.classes.bodyText}>Remember me</span>
            </label>
            <a href="#" className={`font-medium ${theme.classes.link}`}>
              Forgot Password?
            </a>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className={`w-full rounded-xl py-2.5 font-semibold shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:py-3 ${theme.classes.primaryButton}`}
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 sm:my-7">
          <div className={`h-px flex-1 ${theme.classes.divider}`} />
          <span className={`shrink-0 text-xs ${theme.classes.subtle}`}>
            or continue with
          </span>
          <div className={`h-px flex-1 ${theme.classes.divider}`} />
        </div>

        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4">
          <button
            type="button"
            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${theme.classes.socialButton}`}
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${theme.classes.socialButton}`}
          >
            <FacebookIcon />
            Facebook
          </button>
        </div>

        <p
          className={`mt-5 text-center text-xs leading-relaxed sm:mt-7 ${theme.classes.subtle}`}
        >
          By logging in, you agree to our{' '}
          <a href="#" className={theme.classes.link}>
            Terms of Service
          </a>
          <br />
          and{' '}
          <a href="#" className={theme.classes.link}>
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </section>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill={theme.colors.googleYellow}
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill={theme.colors.googleRed}
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill={theme.colors.googleGreen}
        d="M24 44c5.5 0 10.4-1.9 14.2-5l-6.6-5.4C29.6 35.4 27 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.9 39.8 16.4 44 24 44z"
      />
      <path
        fill={theme.colors.googleBlue}
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.6 5.4C41.4 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={theme.colors.facebookBlue}
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
      />
    </svg>
  )
}

export default LoginForm
