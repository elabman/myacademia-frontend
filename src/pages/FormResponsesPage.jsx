import { ArrowLeft, Eye, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TableFilterBar from '../components/TableFilterBar'
import { useAuth } from '../hooks/useAuth'
import {
  deleteFormResponse,
  getForm,
  listFormResponses,
} from '../services/formService'
import { theme } from '../theme'
import { answerToText, formatDateTime } from '../utils/formOptions'
import { useTableFilters } from '../utils/tableTools'

const VISIBLE_QUESTIONS = 4 // columns shown in the table; every answer is in the details and the export
const dateKeys = [{ key: 'submitted_at', label: 'Submitted' }]

function FormResponsesPage() {
  const { auth } = useAuth()
  const { formId } = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const [formData, responses] = await Promise.all([
        getForm(auth.accessToken, formId),
        listFormResponses(auth.accessToken, formId, { limit: 5000 }),
      ])

      setForm(formData)
      // "2026-11-14 10:05:00" -> ISO-like so every browser parses it the same way
      setRows(responses.map((row) => ({ ...row, submitted_at: String(row.submitted_at).replace(' ', 'T') })))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, formId])

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 0)

    return () => window.clearTimeout(timeoutId)
  }, [load])

  const questions = useMemo(
    () => (form ? form.sections.flatMap((section) => section.questions) : []),
    [form],
  )
  const filters = useTableFilters(rows, { dateKeys })

  const visibleRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return filters.filteredRows
    }

    return filters.filteredRows.filter((row) =>
      [row.email, ...Object.values(row.answers).map(answerToText)]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [filters.filteredRows, searchTerm])

  // Export: submitted time, email and every question; the PDF keeps the first few so it stays readable.
  const exportColumns = useMemo(
    () => [
      { get: (row) => row.submitted_at.replace('T', ' '), label: 'Submitted' },
      { get: (row) => row.email ?? '', label: 'Email' },
      ...questions.map((question) => ({
        get: (row) => answerToText(row.answers[question.question_id]),
        label: question.label,
      })),
    ],
    [questions],
  )

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this response permanently?')) {
      return
    }

    try {
      await deleteFormResponse(auth.accessToken, formId, row.response_id)
      setSelected(null)
      await load()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const shownQuestions = questions.slice(0, VISIBLE_QUESTIONS)
  const cell = `border-b px-3 py-3 ${theme.classes.tableRowDivider} ${theme.classes.bodyText}`

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>{form?.course_title ?? form?.title ?? 'Applicants'}</h2>
          <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            Applicants · {rows.length} application{rows.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            to={form?.short_course_id ? `/dashboard/short-courses/${form.short_course_id}/application` : `/dashboard/forms/${formId}`}
          >
            <ArrowLeft size={16} />
            Back to application form
          </Link>
          <button
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            onClick={load}
            type="button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {errorMessage && (
        <section className={`rounded-2xl border p-4 text-sm ${theme.classes.errorBox}`}>{errorMessage}</section>
      )}

      <section className={`border-t-4 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}>
        <div className="p-4">
          <div className="relative w-full max-w-sm">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.classes.icon}`} size={17} />
            <input
              className={`w-full border px-10 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.tableSearch}`}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search answers"
              value={searchTerm}
            />
          </div>
        </div>

        <TableFilterBar
          exportConfig={{
            columns: exportColumns,
            pdfColumns: exportColumns.slice(0, 6),
            rows: visibleRows,
            title: form?.title ?? 'Form responses',
          }}
          filters={filters}
        />

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className={theme.classes.tableHeader}>
              <tr>
                {['Actions', 'No', 'Submitted', 'Email', ...shownQuestions.map((question) => question.label)].map((heading) => (
                  <th className={`max-w-56 whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`} key={heading}>
                    <span className="block truncate" title={heading}>{heading}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className={`px-3 py-8 text-center ${theme.classes.muted}`} colSpan={4 + shownQuestions.length}>
                    Loading responses...
                  </td>
                </tr>
              )}
              {!isLoading && visibleRows.length === 0 && (
                <tr>
                  <td className={`px-3 py-8 text-center ${theme.classes.muted}`} colSpan={4 + shownQuestions.length}>
                    {rows.length === 0 ? 'No responses yet.' : 'No responses match the filters.'}
                  </td>
                </tr>
              )}
              {!isLoading &&
                visibleRows.map((row, index) => (
                  <tr className={`align-top transition ${theme.classes.tableRowHover}`} key={row.response_id}>
                    <td className={cell}>
                      <button
                        aria-label="View response"
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${theme.classes.tableToolbarButton}`}
                        onClick={() => setSelected(row)}
                        title="View all answers"
                        type="button"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                    <td className={cell}>{index + 1}</td>
                    <td className={`${cell} whitespace-nowrap`}>{formatDateTime(row.submitted_at)}</td>
                    <td className={cell}>{row.email ?? '-'}</td>
                    {shownQuestions.map((question) => (
                      <td className={`${cell} max-w-56`} key={question.question_id}>
                        <span className="line-clamp-2">{answerToText(row.answers[question.question_id]) || '-'}</span>
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className={`border-t px-4 py-3 text-sm ${theme.classes.tableDivider}`}>
          <p className={theme.classes.muted}>
            Showing {visibleRows.length} of {rows.length} responses. Export includes every answer.
          </p>
        </div>
      </section>

      {selected && (
        <ResponseDetails
          form={form}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected)}
          row={selected}
        />
      )}
    </section>
  )
}

function ResponseDetails({ form, onClose, onDelete, row }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.classes.modalOverlay}`}>
      <section className={`flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border ${theme.classes.modalPanel}`}>
        <div className={`flex items-center justify-between border-b p-5 ${theme.classes.tableDivider}`}>
          <div>
            <h2 className={`text-lg font-bold ${theme.classes.heading}`}>Application details</h2>
            <p className={`mt-1 text-sm ${theme.classes.muted}`}>
              {row.email ?? 'No email'} · {formatDateTime(row.submitted_at)}
            </p>
          </div>
          <button
            aria-label="Close"
            className={`rounded-xl p-2 transition ${theme.classes.icon} ${theme.classes.iconHover}`}
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-5">
          {form.sections.map((section) => (
            <div key={section.section_id}>
              <h3 className={`mb-2 text-sm font-bold ${theme.classes.heading}`}>{section.title}</h3>
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {section.questions.map((question) => (
                  <div className="grid gap-1 px-4 py-2.5 text-sm sm:grid-cols-[1fr_1.2fr] sm:gap-4" key={question.question_id}>
                    <dt className="text-slate-500">{question.label}</dt>
                    <dd className="whitespace-pre-wrap break-words font-medium text-slate-900">
                      {answerToText(row.answers[question.question_id]) || '-'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className={`flex justify-between gap-3 border-t p-4 ${theme.classes.tableDivider}`}>
          <button
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.dangerButton}`}
            onClick={onDelete}
            type="button"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  )
}

export default FormResponsesPage
