export const questionTypes = [
  { value: 'short_text', label: 'Short answer' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'checkboxes', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'email', label: 'Email address' },
  { value: 'phone', label: 'Phone number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'consent', label: 'Consent checkbox' },
]

export const choiceTypes = ['multiple_choice', 'checkboxes', 'dropdown']

export const applicationTypes = [
  'Training application',
  'Scholarship application',
  'Job application',
  'Event registration',
  'Survey',
  'Other',
]

// state = draft | scheduled | open | expired | closed (computed by the API)
export const formStates = {
  closed: { className: 'bg-slate-200 text-slate-700', label: 'Closed' },
  draft: { className: 'bg-amber-100 text-amber-800', label: 'Draft' },
  expired: { className: 'bg-red-100 text-red-700', label: 'Expired' },
  open: { className: 'bg-emerald-100 text-emerald-700', label: 'Published · open' },
  scheduled: { className: 'bg-sky-100 text-sky-700', label: 'Scheduled' },
}

export function getFormUrl(slug) {
  return `${window.location.origin}/apply/${slug}`
}

const pad = (number) => String(number).padStart(2, '0')

/** ISO (UTC) from the API -> value for <input type="datetime-local"> in the viewer's time zone. */
export function isoToLocalInput(iso) {
  if (!iso) {
    return ''
  }

  const date = new Date(iso)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** datetime-local value (viewer's time zone) -> ISO (UTC) for the API. */
export function localInputToIso(value) {
  return value ? new Date(value).toISOString() : null
}

export function formatDateTime(iso) {
  return iso
    ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : ''
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/

const isBlank = (value) =>
  value === undefined ||
  value === null ||
  value === false ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0)

/** Quick checks before sending; the API repeats them. Returns { [questionId]: message }. */
export function validateAnswers(sections, values) {
  const errors = {}

  sections.forEach((section) =>
    section.questions.forEach((question) => {
      const value = values[question.question_id]
      const id = question.question_id

      if (isBlank(value)) {
        if (question.is_required) {
          errors[id] =
            question.question_type === 'consent'
              ? 'Please tick this box to continue.'
              : 'This question is required.'
        }

        return
      }

      if (question.question_type === 'email' && !EMAIL_PATTERN.test(String(value).trim())) {
        errors[id] = 'Enter a valid email address.'
      }

      if (question.question_type === 'phone' && !PHONE_PATTERN.test(String(value).trim())) {
        errors[id] = 'Enter a valid phone number, for example +250 788 123 456.'
      }

      if (question.question_type === 'number' && !Number.isFinite(Number(value))) {
        errors[id] = 'Enter a number.'
      }
    }),
  )

  return errors
}

/** Values keyed by question id, without the blank ones, as the API expects them. */
export function toAnswerPayload(values) {
  return Object.fromEntries(
    Object.entries(values)
      .filter(([, value]) => !isBlank(value))
      .map(([id, value]) => [id, typeof value === 'string' ? value.trim() : value]),
  )
}

export function answerToText(value) {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return value ?? ''
}
