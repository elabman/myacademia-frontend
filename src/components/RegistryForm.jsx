import { Link } from 'react-router-dom'
import { theme } from '../theme'

function RegistryForm({ backTo, fields, title }) {
  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
            {title}
          </h2>
          <p className={`mt-1 text-sm ${theme.classes.muted}`}>
            Fill the registry details. This form is separate from the table
            view.
          </p>
        </div>
        <Link
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.socialButton}`}
          to={backTo}
        >
          Back to table
        </Link>
      </div>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        onSubmit={(event) => event.preventDefault()}
      >
        {fields.slice(1).map(([key, label]) => (
          <label className="grid gap-1.5" key={key}>
            <span className={`text-xs font-semibold ${theme.classes.label}`}>
              {label}
            </span>
            <input
              className={`rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.field}`}
              name={key}
              type={fieldType(key)}
            />
          </label>
        ))}

        <div className="flex items-end md:col-span-2 xl:col-span-3">
          <button
            type="submit"
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
          >
            Save
          </button>
        </div>
      </form>
    </section>
  )
}

function fieldType(key) {
  if (key.toLowerCase().includes('date')) {
    return 'date'
  }

  if (
    [
      'duration',
      'budgetUsd',
      'budgetRwf',
      'collegeContribution',
      'donorContribution',
      'beneficiaries',
      'achievement',
      'days',
      'hours',
      'female',
      'male',
      'total',
      'certified',
      'fee',
      'revenue',
    ].includes(key)
  ) {
    return 'number'
  }

  return 'text'
}

export default RegistryForm
