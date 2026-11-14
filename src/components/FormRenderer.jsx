import { theme } from '../theme'

const inputClass = `w-full rounded-xl border px-3 py-2.5 text-base transition focus:outline-none focus:ring-2 sm:text-sm ${theme.classes.formControl}`

/**
 * Draws a form's sections and questions. Used by the public application page and by the
 * builder's preview, so both always look the same.
 * values: { [questionId]: string | string[] | boolean }
 */
function FormRenderer({ disabled = false, errors = {}, onChange, sections, values }) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          key={section.section_id}
        >
          <header className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">{section.title}</h2>
            {section.description && (
              <p className="mt-1 text-sm text-slate-500">{section.description}</p>
            )}
          </header>

          {section.questions.map((question) => (
            <Question
              disabled={disabled}
              error={errors[question.question_id]}
              key={question.question_id}
              onChange={(value) => onChange(question.question_id, value)}
              question={question}
              value={values[question.question_id]}
            />
          ))}
        </section>
      ))}
    </div>
  )
}

function Question({ disabled, error, onChange, question, value }) {
  const id = `q-${question.question_id}`
  const { question_type: type } = question
  const isConsent = type === 'consent'

  return (
    <div data-question={question.question_id}>
      {!isConsent && (
        <label className="block text-sm font-semibold text-slate-800" htmlFor={id}>
          {question.label}
          {question.is_required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}
      {question.help_text && !isConsent && (
        <p className="mt-0.5 text-xs text-slate-500">{question.help_text}</p>
      )}

      <div className={isConsent ? '' : 'mt-2'}>
        {renderInput({ disabled, id, onChange, question, type, value })}
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function renderInput({ disabled, id, onChange, question, type, value }) {
  const options = type === 'yes_no' ? ['Yes', 'No'] : question.options ?? []

  switch (type) {
    case 'paragraph':
      return (
        <textarea
          className={inputClass}
          disabled={disabled}
          id={id}
          maxLength={5000}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          value={value ?? ''}
        />
      )
    case 'dropdown':
      return (
        <select
          className={inputClass}
          disabled={disabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={value ?? ''}
        >
          <option value="">Choose…</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    case 'multiple_choice':
    case 'yes_no':
      return (
        <div className="space-y-2" role="radiogroup">
          {options.map((option) => (
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700" key={option}>
              <input
                checked={value === option}
                className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
                disabled={disabled}
                name={id}
                onChange={() => onChange(option)}
                type="radio"
              />
              {option}
            </label>
          ))}
        </div>
      )
    case 'checkboxes': {
      const selected = Array.isArray(value) ? value : []

      return (
        <div className="space-y-2">
          {options.map((option) => (
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700" key={option}>
              <input
                checked={selected.includes(option)}
                className={`h-4 w-4 rounded ${theme.classes.checkbox}`}
                disabled={disabled}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option),
                  )
                }
                type="checkbox"
              />
              {option}
            </label>
          ))}
        </div>
      )
    }
    case 'consent':
      return (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {question.help_text && (
            <p className="text-sm leading-relaxed text-slate-600">{question.help_text}</p>
          )}
          <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-slate-800">
            <input
              checked={value === true}
              className={`mt-0.5 h-4 w-4 shrink-0 rounded ${theme.classes.checkbox}`}
              disabled={disabled}
              onChange={(event) => onChange(event.target.checked)}
              type="checkbox"
            />
            <span>
              {question.label}
              {question.is_required && <span className="ml-1 text-red-600">*</span>}
            </span>
          </label>
        </div>
      )
    default: {
      const htmlType = { date: 'date', email: 'email', number: 'number', phone: 'tel' }[type] ?? 'text'

      return (
        <input
          autoComplete={type === 'email' ? 'email' : type === 'phone' ? 'tel' : undefined}
          className={inputClass}
          disabled={disabled}
          id={id}
          inputMode={type === 'phone' ? 'tel' : type === 'number' ? 'decimal' : undefined}
          maxLength={type === 'short_text' ? 500 : undefined}
          onChange={(event) => onChange(event.target.value)}
          type={htmlType}
          value={value ?? ''}
        />
      )
    }
  }
}

export default FormRenderer
