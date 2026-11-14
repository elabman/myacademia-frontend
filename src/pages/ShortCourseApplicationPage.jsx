import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Inbox,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  closeForm,
  createForm,
  deleteForm,
  listFormTemplates,
  listForms,
  publishForm,
  unpublishForm,
} from '../services/formService'
import { getShortCourse } from '../services/registryService'
import { theme } from '../theme'
import { formatDateTime, formStates, getFormUrl } from '../utils/formOptions'

// The application form of ONE short course: internal screen for staff. Applicants only ever
// get the public link (/apply/<slug>); they never see this page or the applicants list.
function ShortCourseApplicationPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState(null)
  const [isBusy, setIsBusy] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const [courseData, forms] = await Promise.all([
        getShortCourse(auth.accessToken, courseId),
        listForms(auth.accessToken, { short_course_id: courseId }),
      ])

      setCourse(courseData)
      setForm(forms[0] ?? null)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, courseId])

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 0)

    return () => window.clearTimeout(timeoutId)
  }, [load])

  const runAction = async (action, doneMessage, confirmation) => {
    if (confirmation && !window.confirm(confirmation)) {
      return
    }

    setErrorMessage('')
    setNotice('')
    setIsBusy(true)

    try {
      await action(auth.accessToken, form.form_id)
      setNotice(doneMessage)
      await load()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsBusy(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFormUrl(form.slug))
      setNotice('Link copied.')
    } catch {
      window.prompt('Copy this link:', getFormUrl(form.slug))
    }
  }

  const courseTitle = course?.title ?? ''
  const state = form ? formStates[form.state] ?? formStates.draft : null
  const isLive = form && (form.state === 'open' || form.state === 'scheduled')

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>Application form</h2>
          <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            {courseTitle || 'Short course'}
          </p>
        </div>
        <Link
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
          to="/dashboard/short-courses"
        >
          <ArrowLeft size={16} />
          Back to Short Courses
        </Link>
      </div>

      <p className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-600">
        <Lock size={14} className="shrink-0" />
        Internal page: only staff see this. Applicants only receive the public link below once the form is published.
      </p>

      {errorMessage && (
        <section className={`rounded-2xl border p-4 text-sm ${theme.classes.errorBox}`} role="alert">
          {errorMessage}
        </section>
      )}
      {notice && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notice}</p>
      )}

      {isLoading ? (
        <p className={`text-sm ${theme.classes.muted}`}>Loading...</p>
      ) : !course ? null : !form ? (
        <CreatePanel
          accessToken={auth.accessToken}
          courseId={courseId}
          courseTitle={courseTitle}
          onCreated={(created) => navigate(`/dashboard/forms/${created.form_id}`)}
        />
      ) : (
        <section className={`space-y-5 border-t-4 p-5 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className={`text-base font-bold ${theme.classes.heading}`}>{form.title}</h3>
              <p className={`mt-1 text-sm ${theme.classes.muted}`}>
                {form.question_count} questions
                {form.application_type ? ` · ${form.application_type}` : ''}
              </p>
            </div>
            <span className={`inline-block w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${state.className}`}>
              {state.label}
            </span>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            <Stat label="Applicants" value={form.response_count} />
            <Stat label="Opens" value={formatDateTime(form.opens_at) || 'When published'} />
            <Stat label="Expires" value={formatDateTime(form.closes_at) || 'Never'} />
          </dl>

          {form.state !== 'draft' && (
            <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 break-all">
                Public link for applicants: <strong>{getFormUrl(form.slug)}</strong>
              </span>
              <div className="flex shrink-0 gap-2">
                <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 font-semibold" onClick={copyLink} type="button">
                  <Copy size={15} />
                  Copy
                </button>
                <a className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 font-semibold" href={getFormUrl(form.slug)} rel="noreferrer" target="_blank">
                  <ExternalLink size={15} />
                  Open
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
              to={`/dashboard/forms/${form.form_id}/responses`}
            >
              <Inbox size={16} />
              View applicants ({form.response_count})
            </Link>
            <Link
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              to={`/dashboard/forms/${form.form_id}`}
            >
              <Pencil size={16} />
              Edit form
            </Link>
            {isLive ? (
              <button
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${theme.classes.tableToolbarButton}`}
                disabled={isBusy}
                onClick={() => runAction(closeForm, 'Form closed.', 'Stop accepting applications for this course?')}
                type="button"
              >
                Close applications
              </button>
            ) : (
              <button
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${theme.classes.tableToolbarButton}`}
                disabled={isBusy}
                onClick={() => runAction(publishForm, 'Form published.')}
                type="button"
              >
                Publish
              </button>
            )}
            {form.state === 'closed' && (
              <button
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${theme.classes.tableToolbarButton}`}
                disabled={isBusy}
                onClick={() => runAction(unpublishForm, 'Moved back to draft.')}
                type="button"
              >
                Back to draft
              </button>
            )}
            <button
              className={`ml-auto inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${theme.classes.dangerButton}`}
              disabled={isBusy}
              onClick={() => runAction(deleteForm, 'Form deleted.', `Delete the application form of "${courseTitle}"? This cannot be undone.`)}
              title={form.response_count > 0 ? 'A form with applicants cannot be deleted: close it instead' : 'Delete the form'}
              type="button"
            >
              <Trash2 size={16} />
              Delete form
            </button>
          </div>
        </section>
      )}
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-slate-900">{value}</dd>
    </div>
  )
}

function CreatePanel({ accessToken, courseId, courseTitle, onCreated }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [source, setSource] = useState('blank')
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    let isActive = true

    listFormTemplates(accessToken)
      .then((rows) => isActive && setTemplates(rows))
      .catch(() => isActive && setTemplates([]))

    return () => {
      isActive = false
    }
  }, [accessToken])

  const handleCreate = async () => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const body =
        source === 'blank'
          ? {
              application_type: 'Training application',
              sections: [{ questions: [], title: 'Section 1' }],
              short_course_id: Number(courseId),
            }
          : { short_course_id: Number(courseId), template: source }

      onCreated(await createForm(accessToken, body))
    } catch (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  const choice = (value) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
      source === value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
    }`

  return (
    <section className={`space-y-4 border-t-4 p-5 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}>
      <div>
        <h3 className={`text-base font-bold ${theme.classes.heading}`}>No application form yet</h3>
        <p className={`mt-1 text-sm ${theme.classes.muted}`}>
          Create the form people fill in to apply for <strong>{courseTitle}</strong>. You can edit every question afterwards.
        </p>
      </div>

      {errorMessage && <p className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}>{errorMessage}</p>}

      <fieldset className="space-y-2">
        <legend className={`mb-1 text-xs font-semibold ${theme.classes.subtle}`}>Start from</legend>
        {templates.map((template) => (
          <label className={choice(template.code)} key={template.code}>
            <input checked={source === template.code} name="source" onChange={() => setSource(template.code)} type="radio" />
            <span>
              <strong className="block">{template.title}</strong>
              <span className="text-slate-500">
                {template.description} {template.question_count} questions.
              </span>
            </span>
          </label>
        ))}
        <label className={choice('blank')}>
          <input checked={source === 'blank'} name="source" onChange={() => setSource('blank')} type="radio" />
          <span>
            <strong className="block">Blank form</strong>
            <span className="text-slate-500">Add your own sections and questions.</span>
          </span>
        </label>
      </fieldset>

      <button
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:opacity-60 ${theme.classes.primaryButton}`}
        disabled={isSubmitting}
        onClick={handleCreate}
        type="button"
      >
        <Plus size={17} />
        {isSubmitting ? 'Creating...' : 'Create application form'}
      </button>
    </section>
  )
}

export default ShortCourseApplicationPage
