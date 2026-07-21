import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { theme } from '../theme'

function RegistryDetail({
  backTo,
  columns,
  errorMessage,
  isLoading = false,
  record,
  title,
}) {
  if (isLoading || errorMessage || !record) {
    return (
      <section
        className={`rounded-2xl border p-6 ${theme.classes.dashboardSurface}`}
      >
        <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
          {isLoading
            ? 'Loading record'
            : errorMessage
              ? 'Could not load record'
              : 'Record not found'}
        </h2>
        <p className={`mt-2 text-sm ${theme.classes.muted}`}>
          {isLoading
            ? 'Please wait while the full details are loaded.'
            : errorMessage || 'The selected record could not be found.'}
        </p>
        <Link
          className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
          to={backTo}
        >
          <ArrowLeft size={16} />
          Back to table
        </Link>
      </section>
    )
  }

  const [primaryKey] = columns[1] ?? columns[0]
  const primaryValue = record[primaryKey]
  const summaryFields = columns.slice(0, 8)
  const detailFields = columns.slice(8)

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            {title}
          </p>
          <h2 className={`mt-1 text-xl font-bold ${theme.classes.heading}`}>
            {primaryValue}
          </h2>
        </div>
        <Link
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
          to={backTo}
        >
          <ArrowLeft size={16} />
          Back to table
        </Link>
      </div>

      <section
        className={`rounded-2xl border p-5 ${theme.classes.dashboardSurface}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.classes.dashboardIconMessages}`}
          >
            <FileText size={22} />
          </div>
          <div>
            <h3 className={`font-bold ${theme.classes.heading}`}>
              Quick Overview
            </h3>
            <p className={`text-sm ${theme.classes.muted}`}>
              Important fields for this record.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryFields.map(([key, label]) => (
            <DetailField key={key} label={label} value={record[key]} />
          ))}
        </div>
      </section>

      <section
        className={`rounded-2xl border p-5 ${theme.classes.dashboardSurface}`}
      >
        <h3 className={`font-bold ${theme.classes.heading}`}>
          Full Information
        </h3>
        <p className={`mt-1 text-sm ${theme.classes.muted}`}>
          All remaining registry details.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {detailFields.map(([key, label]) => (
            <DetailField key={key} label={label} value={record[key]} />
          ))}
        </div>
      </section>
    </section>
  )
}

function DetailField({ label, value }) {
  return (
    <div className={`rounded-xl border p-3 ${theme.classes.dashboardSurface}`}>
      <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
        {label}
      </p>
      <p className={`mt-1 text-sm ${theme.classes.bodyText}`}>
        {value || '-'}
      </p>
    </div>
  )
}

export default RegistryDetail
