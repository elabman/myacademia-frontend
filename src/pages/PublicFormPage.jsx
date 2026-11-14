import { CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import logo from '../assets/images/kigali-college-logo.png'
import FormRenderer from '../components/FormRenderer'
import { getPublicForm, submitPublicForm } from '../services/formService'
import { formatDateTime, toAnswerPayload, validateAnswers } from '../utils/formOptions'

// Public application form, opened from the link an administrator shares (no login).
function PublicFormPage() {
  const { slug } = useParams()
  const topRef = useRef(null)
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [values, setValues] = useState({})

  useEffect(() => {
    let isActive = true

    getPublicForm(slug)
      .then((data) => isActive && setForm(data))
      .catch((error) => isActive && setLoadError(error.message))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [slug])

  const handleChange = (questionId, value) => {
    setValues((current) => ({ ...current, [questionId]: value }))
    setErrors((current) => {
      if (!current[questionId]) {
        return current
      }

      const { [questionId]: removed, ...rest } = current
      void removed

      return rest
    })
  }

  const scrollToFirstProblem = (problemIds) => {
    const first = document.querySelector(`[data-question="${problemIds[0]}"]`)

    if (first) {
      first.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const problems = validateAnswers(form.sections, values)

    if (Object.keys(problems).length > 0) {
      setErrors(problems)
      setSubmitError(`Please fix ${Object.keys(problems).length} highlighted answer(s) below.`)
      scrollToFirstProblem(Object.keys(problems))

      return
    }

    setIsSubmitting(true)

    try {
      setConfirmation(await submitPublicForm(slug, toAnswerPayload(values)))
      window.scrollTo({ top: 0 })
    } catch (error) {
      setSubmitError(error.message)
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#eef0fb] px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-2xl space-y-5" ref={topRef}>
        <img alt="Kigali College" className="mx-auto h-16 w-auto sm:h-20" src={logo} />

        {isLoading ? (
          <Notice>
            <Loader2 className="mx-auto animate-spin text-slate-400" size={28} />
          </Notice>
        ) : loadError ? (
          <Notice>
            <h1 className="text-lg font-bold text-slate-900">Form not available</h1>
            <p className="mt-1 text-sm text-slate-500">{loadError}</p>
          </Notice>
        ) : confirmation ? (
          <Notice>
            <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
            <h1 className="mt-3 text-xl font-bold text-slate-900">Application received</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{confirmation}</p>
          </Notice>
        ) : form.state !== 'open' ? (
          <Notice>
            <Clock className="mx-auto text-slate-400" size={44} />
            <h1 className="mt-3 text-lg font-bold text-slate-900">{form.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{form.message}</p>
            {form.state === 'scheduled' && form.opens_at && (
              <p className="mt-1 text-sm text-slate-500">Opens on {formatDateTime(form.opens_at)}.</p>
            )}
          </Notice>
        ) : (
          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <header className="rounded-2xl border-t-8 border-[#1076bd] bg-white p-5 shadow-sm sm:p-6">
              {form.course_title && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1076bd]">
                  Application · {form.course_title}
                </p>
              )}
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{form.title}</h1>
              {form.description && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{form.description}</p>
              )}
              {form.closes_at && (
                <p className="mt-3 text-xs font-medium text-slate-500">
                  Applications close on {formatDateTime(form.closes_at)}.
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                <span className="text-red-600">*</span> Required
              </p>
            </header>

            {submitError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {submitError}
              </p>
            )}

            <FormRenderer
              disabled={isSubmitting}
              errors={errors}
              onChange={handleChange}
              sections={form.sections}
              values={values}
            />

            <button
              className="w-full rounded-xl bg-gradient-to-r from-[#1076bd] to-[#0b5d97] px-4 py-3.5 text-base font-semibold text-white shadow-lg transition hover:brightness-105 disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

function Notice({ children }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">{children}</div>
  )
}

export default PublicFormPage
