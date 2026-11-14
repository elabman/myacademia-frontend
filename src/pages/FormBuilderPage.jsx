import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Eye,
  Inbox,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FormRenderer from '../components/FormRenderer'
import { useAuth } from '../hooks/useAuth'
import {
  closeForm,
  getForm,
  publishForm,
  saveForm,
  unpublishForm,
} from '../services/formService'
import { theme } from '../theme'
import {
  applicationTypes,
  choiceTypes,
  formatDateTime,
  formStates,
  getFormUrl,
  isoToLocalInput,
  localInputToIso,
  questionTypes,
} from '../utils/formOptions'

const inputClass = `w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`
const smallButton = `inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${theme.classes.tableToolbarButton}`

let keyCounter = 0
const newKey = () => `new-${(keyCounter += 1)}`

const parseOptions = (text) =>
  [...new Set((text ?? '').split('\n').map((line) => line.trim()).filter(Boolean))]

const emptyQuestion = () => ({
  _key: newKey(),
  help_text: '',
  is_required: false,
  label: '',
  optionsText: '',
  options: null,
  question_id: null,
  question_type: 'short_text',
})

// API form -> editable form (stable keys for React, options as one choice per line, local dates).
function toEditable(form) {
  return {
    ...form,
    closes_at: isoToLocalInput(form.closes_at),
    opens_at: isoToLocalInput(form.opens_at),
    sections: form.sections.map((section) => ({
      ...section,
      _key: `s-${section.section_id}`,
      description: section.description ?? '',
      questions: section.questions.map((question) => ({
        ...question,
        _key: `q-${question.question_id}`,
        help_text: question.help_text ?? '',
        optionsText: (question.options ?? []).join('\n'),
      })),
    })),
  }
}

function toPayload(form) {
  return {
    application_type: form.application_type,
    closes_at: localInputToIso(form.closes_at),
    confirmation_message: form.confirmation_message,
    description: form.description,
    limit_one_per_email: form.limit_one_per_email,
    opens_at: localInputToIso(form.opens_at),
    sections: form.sections.map((section) => ({
      description: section.description,
      questions: section.questions.map((question) => ({
        help_text: question.help_text,
        is_required: question.is_required,
        label: question.label,
        options: choiceTypes.includes(question.question_type)
          ? parseOptions(question.optionsText)
          : null,
        question_id: question.question_id,
        question_type: question.question_type,
      })),
      section_id: section.section_id,
      title: section.title,
    })),
    title: form.title,
  }
}

function findProblem(form) {
  if (!form.title.trim()) {
    return 'Give the form a title.'
  }

  for (const section of form.sections) {
    if (!section.title.trim()) {
      return 'Every section needs a title.'
    }

    for (const question of section.questions) {
      if (!question.label.trim()) {
        return `Every question needs a label (section "${section.title}").`
      }

      if (choiceTypes.includes(question.question_type) && parseOptions(question.optionsText).length === 0) {
        return `"${question.label}" needs at least one choice.`
      }
    }
  }

  if (form.opens_at && form.closes_at && new Date(form.closes_at) <= new Date(form.opens_at)) {
    return 'The expiry date must be after the opening date.'
  }

  return ''
}

const move = (items, index, direction) => {
  const target = index + direction

  if (target < 0 || target >= items.length) {
    return items
  }

  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]

  return next
}

function FormBuilderPage() {
  const { auth } = useAuth()
  const { formId } = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewValues, setPreviewValues] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const loadForm = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      setForm(toEditable(await getForm(auth.accessToken, formId)))
      setIsDirty(false)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, formId])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadForm, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadForm])

  useEffect(() => {
    if (!isDirty) {
      return undefined
    }

    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)

    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  const change = (updater) => {
    setForm((current) => ({ ...current, ...updater(current) }))
    setIsDirty(true)
    setSuccessMessage('')
  }

  const updateSection = (sectionIndex, patch) =>
    change((current) => ({
      sections: current.sections.map((section, index) =>
        index === sectionIndex ? { ...section, ...patch } : section,
      ),
    }))

  const updateQuestion = (sectionIndex, questionIndex, patch) =>
    updateSection(sectionIndex, {
      questions: form.sections[sectionIndex].questions.map((question, index) =>
        index === questionIndex ? { ...question, ...patch } : question,
      ),
    })

  const changeType = (sectionIndex, questionIndex, type) => {
    const question = form.sections[sectionIndex].questions[questionIndex]

    updateQuestion(sectionIndex, questionIndex, {
      optionsText:
        choiceTypes.includes(type) && !question.optionsText.trim() ? 'Option 1' : question.optionsText,
      question_type: type,
    })
  }

  const addSection = () =>
    change((current) => ({
      sections: [
        ...current.sections,
        {
          _key: newKey(),
          description: '',
          questions: [emptyQuestion()],
          section_id: null,
          title: `Section ${current.sections.length + 1}`,
        },
      ],
    }))

  const removeSection = (sectionIndex) => {
    const section = form.sections[sectionIndex]

    if (
      section.questions.length > 0 &&
      !window.confirm(`Delete "${section.title}" and its ${section.questions.length} question(s)? Answers already collected for them are deleted too.`)
    ) {
      return
    }

    change((current) => ({ sections: current.sections.filter((_, index) => index !== sectionIndex) }))
  }

  const save = async () => {
    const problem = findProblem(form)

    if (problem) {
      setErrorMessage(problem)

      return false
    }

    setErrorMessage('')
    setIsSaving(true)

    try {
      setForm(toEditable(await saveForm(auth.accessToken, formId, toPayload(form))))
      setIsDirty(false)
      setSuccessMessage('Saved.')

      return true
    } catch (error) {
      setErrorMessage(error.message)

      return false
    } finally {
      setIsSaving(false)
    }
  }

  const runStatusAction = async (action, doneMessage) => {
    if (isDirty && !(await save())) {
      return
    }

    setErrorMessage('')
    setIsSaving(true)

    try {
      setForm(toEditable(await action(auth.accessToken, formId)))
      setSuccessMessage(doneMessage)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFormUrl(form.slug))
      setSuccessMessage('Link copied.')
    } catch {
      window.prompt('Copy this link:', getFormUrl(form.slug))
    }
  }

  if (isLoading) {
    return <p className={`text-sm ${theme.classes.muted}`}>Loading form...</p>
  }

  if (!form) {
    return (
      <section className={`rounded-2xl border p-4 text-sm ${theme.classes.errorBox}`}>
        {errorMessage || 'The form could not be loaded.'}{' '}
        <Link className="font-semibold underline" to="/dashboard/short-courses">
          Back to short courses
        </Link>
      </section>
    )
  }

  const backTo = form.short_course_id
    ? `/dashboard/short-courses/${form.short_course_id}/application`
    : '/dashboard/short-courses'
  const state = formStates[form.state] ?? formStates.draft
  const isLive = form.state === 'open' || form.state === 'scheduled'
  const previewSections = form.sections.map((section) => ({
    ...section,
    section_id: section._key,
    questions: section.questions.map((question) => ({
      ...question,
      options: choiceTypes.includes(question.question_type) ? parseOptions(question.optionsText) : null,
      question_id: question._key,
    })),
  }))

  return (
    <section className="space-y-4 pb-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label="Back to the application form of the course"
            className={`${smallButton} shrink-0`}
            to={backTo}
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            {form.course_title && (
              <p className={`truncate text-xs font-semibold uppercase ${theme.classes.subtle}`}>{form.course_title}</p>
            )}
            <h2 className={`truncate text-lg font-bold ${theme.classes.heading}`}>{form.title || 'Untitled form'}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${state.className}`}>{state.label}</span>
              {isDirty && <span className="text-xs font-semibold text-amber-600">Unsaved changes</span>}
              {successMessage && <span className="text-xs font-semibold text-emerald-600">{successMessage}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            to={`/dashboard/forms/${formId}/responses`}
          >
            <Inbox size={16} />
            Responses
          </Link>
          <button
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            onClick={() => setIsPreview((current) => !current)}
            type="button"
          >
            {isPreview ? <Pencil size={16} /> : <Eye size={16} />}
            {isPreview ? 'Back to editing' : 'Preview'}
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${theme.classes.tableToolbarButton}`}
            disabled={isSaving || !isDirty}
            onClick={save}
            type="button"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {isLive ? (
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${theme.classes.tableToolbarButton}`}
              disabled={isSaving}
              onClick={() => window.confirm('Stop accepting responses?') && runStatusAction(closeForm, 'Form closed.')}
              type="button"
            >
              Close form
            </button>
          ) : (
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:opacity-50 ${theme.classes.primaryButton}`}
              disabled={isSaving}
              onClick={() => runStatusAction(publishForm, 'Form published.')}
              type="button"
            >
              Publish
            </button>
          )}
          {form.state === 'closed' && (
            <button
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              disabled={isSaving}
              onClick={() => runStatusAction(unpublishForm, 'Moved back to draft.')}
              type="button"
            >
              Back to draft
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <section className={`rounded-2xl border p-4 text-sm ${theme.classes.errorBox}`} role="alert">
          {errorMessage}
        </section>
      )}

      {form.state !== 'draft' && (
        <section className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0 break-all">
            Public link: <strong>{getFormUrl(form.slug)}</strong>
            {form.closes_at && ` · expires ${formatDateTime(form.closes_at)}`}
          </span>
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 font-semibold"
            onClick={copyLink}
            type="button"
          >
            <Copy size={15} />
            Copy link
          </button>
        </section>
      )}

      {isPreview ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="rounded-xl bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-700">
            Preview: this is how applicants see the form. Nothing you enter here is saved.
          </p>
          <header className="rounded-2xl border-t-8 border-[#1076bd] bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">{form.title}</h1>
            {form.description && <p className="mt-2 text-sm text-slate-600">{form.description}</p>}
          </header>
          <FormRenderer
            onChange={(id, value) => setPreviewValues((current) => ({ ...current, [id]: value }))}
            sections={previewSections}
            values={previewValues}
          />
        </div>
      ) : (
        <>
          <section className={`space-y-4 border-t-4 p-5 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}>
            <h3 className={`text-sm font-bold uppercase ${theme.classes.heading}`}>Form settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Form title" wide>
                <input className={inputClass} onChange={(event) => change(() => ({ title: event.target.value }))} value={form.title} />
              </Field>
              <Field label="Description (shown at the top of the form)" wide>
                <textarea className={inputClass} onChange={(event) => change(() => ({ description: event.target.value }))} rows={2} value={form.description ?? ''} />
              </Field>
              <Field label="Type of application">
                <input
                  className={inputClass}
                  list="application-types"
                  onChange={(event) => change(() => ({ application_type: event.target.value }))}
                  value={form.application_type ?? ''}
                />
                <datalist id="application-types">
                  {applicationTypes.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </Field>
              <Field label="One application per email address">
                <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
                  <input
                    checked={form.limit_one_per_email}
                    className={`h-4 w-4 rounded ${theme.classes.checkbox}`}
                    onChange={(event) => change(() => ({ limit_one_per_email: event.target.checked }))}
                    type="checkbox"
                  />
                  Reject a second application with the same email (needs an Email question)
                </label>
              </Field>
              <Field label="Opens on (optional)">
                <input className={inputClass} onChange={(event) => change(() => ({ opens_at: event.target.value }))} type="datetime-local" value={form.opens_at} />
              </Field>
              <Field label="Expires on (optional)">
                <input className={inputClass} onChange={(event) => change(() => ({ closes_at: event.target.value }))} type="datetime-local" value={form.closes_at} />
                <p className={`mt-1 text-xs ${theme.classes.subtle}`}>
                  After this time the form closes by itself. Leave empty for no expiry. Times use your local time zone.
                </p>
              </Field>
              <Field label="Message shown after submitting" wide>
                <textarea className={inputClass} onChange={(event) => change(() => ({ confirmation_message: event.target.value }))} rows={3} value={form.confirmation_message ?? ''} />
              </Field>
            </div>
          </section>

          {form.sections.map((section, sectionIndex) => (
            <section className={`space-y-4 border-t-4 border-indigo-400 p-5 ${theme.classes.dashboardSurface}`} key={section._key}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <div className="grid flex-1 gap-3">
                  <input
                    aria-label="Section title"
                    className={`${inputClass} text-base font-semibold`}
                    onChange={(event) => updateSection(sectionIndex, { title: event.target.value })}
                    placeholder="Section title"
                    value={section.title}
                  />
                  <input
                    aria-label="Section description"
                    className={inputClass}
                    onChange={(event) => updateSection(sectionIndex, { description: event.target.value })}
                    placeholder="Section description (optional)"
                    value={section.description}
                  />
                </div>
                <div className="flex gap-1.5">
                  <button aria-label="Move section up" className={smallButton} disabled={sectionIndex === 0} onClick={() => change((current) => ({ sections: move(current.sections, sectionIndex, -1) }))} type="button">
                    <ArrowUp size={15} />
                  </button>
                  <button aria-label="Move section down" className={smallButton} disabled={sectionIndex === form.sections.length - 1} onClick={() => change((current) => ({ sections: move(current.sections, sectionIndex, 1) }))} type="button">
                    <ArrowDown size={15} />
                  </button>
                  <button aria-label="Delete section" className={`${smallButton} ${theme.classes.dangerButton}`} disabled={form.sections.length === 1} onClick={() => removeSection(sectionIndex)} type="button">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {section.questions.map((question, questionIndex) => (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" key={question._key}>
                  <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
                    <input
                      aria-label="Question"
                      className={inputClass}
                      onChange={(event) => updateQuestion(sectionIndex, questionIndex, { label: event.target.value })}
                      placeholder="Question"
                      value={question.label}
                    />
                    <select
                      aria-label="Question type"
                      className={inputClass}
                      onChange={(event) => changeType(sectionIndex, questionIndex, event.target.value)}
                      value={question.question_type}
                    >
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {choiceTypes.includes(question.question_type) && (
                    <label className="grid gap-1">
                      <span className={`text-xs font-semibold ${theme.classes.subtle}`}>Choices (one per line)</span>
                      <textarea
                        className={inputClass}
                        onChange={(event) => updateQuestion(sectionIndex, questionIndex, { optionsText: event.target.value })}
                        rows={Math.min(Math.max(parseOptions(question.optionsText).length + 1, 3), 10)}
                        value={question.optionsText}
                      />
                    </label>
                  )}

                  <input
                    aria-label={question.question_type === 'consent' ? 'Declaration text' : 'Help text'}
                    className={inputClass}
                    onChange={(event) => updateQuestion(sectionIndex, questionIndex, { help_text: event.target.value })}
                    placeholder={question.question_type === 'consent' ? 'Declaration text shown above the checkbox (optional)' : 'Help text (optional)'}
                    value={question.help_text}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        checked={question.is_required}
                        className={`h-4 w-4 rounded ${theme.classes.checkbox}`}
                        onChange={(event) => updateQuestion(sectionIndex, questionIndex, { is_required: event.target.checked })}
                        type="checkbox"
                      />
                      Required
                    </label>
                    <div className="flex gap-1.5">
                      <button aria-label="Move question up" className={smallButton} disabled={questionIndex === 0} onClick={() => updateSection(sectionIndex, { questions: move(section.questions, questionIndex, -1) })} type="button">
                        <ArrowUp size={15} />
                      </button>
                      <button aria-label="Move question down" className={smallButton} disabled={questionIndex === section.questions.length - 1} onClick={() => updateSection(sectionIndex, { questions: move(section.questions, questionIndex, 1) })} type="button">
                        <ArrowDown size={15} />
                      </button>
                      <button
                        aria-label="Duplicate question"
                        className={smallButton}
                        onClick={() =>
                          updateSection(sectionIndex, {
                            questions: [
                              ...section.questions.slice(0, questionIndex + 1),
                              { ...question, _key: newKey(), question_id: null },
                              ...section.questions.slice(questionIndex + 1),
                            ],
                          })
                        }
                        type="button"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        aria-label="Delete question"
                        className={`${smallButton} ${theme.classes.dangerButton}`}
                        onClick={() => updateSection(sectionIndex, { questions: section.questions.filter((_, index) => index !== questionIndex) })}
                        type="button"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                className={`inline-flex items-center gap-2 rounded-xl border border-dashed px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
                onClick={() => updateSection(sectionIndex, { questions: [...section.questions, emptyQuestion()] })}
                type="button"
              >
                <Plus size={16} />
                Add question
              </button>
            </section>
          ))}

          <button
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
            onClick={addSection}
            type="button"
          >
            <Plus size={17} />
            Add section
          </button>
        </>
      )}
    </section>
  )
}

function Field({ children, label, wide }) {
  return (
    <label className={`grid content-start gap-1.5 ${wide ? 'md:col-span-2' : ''}`}>
      <span className={`text-xs font-semibold ${theme.classes.subtle}`}>{label}</span>
      {children}
    </label>
  )
}

export default FormBuilderPage
