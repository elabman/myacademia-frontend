import { ArrowLeft, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { theme } from '../theme'

function ApiListPage({ backTo, columns, emptyMessage, eyebrow, loadData, title }) {
  const { auth } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRows = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      setRows(await loadData(auth.accessToken))
    } catch (error) {
      setErrorMessage(error.message)
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, loadData])

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchRows, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchRows])

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return rows
    }

    return rows.filter((row) =>
      columns.some(({ key }) =>
        String(readValue(row, key)).toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [columns, rows, searchTerm])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
            {title}
          </h2>
          <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            {eyebrow}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {backTo && (
            <Link
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              to={backTo}
            >
              <ArrowLeft size={16} />
              Back to Admin
            </Link>
          )}
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            onClick={fetchRows}
            type="button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <section
        className={`border-t-4 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}
      >
        <div className="p-4">
          <div className="relative w-full max-w-sm">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.classes.icon}`}
              size={17}
            />
            <input
              className={`w-full border px-10 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.tableSearch}`}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}`}
              value={searchTerm}
            />
          </div>
        </div>

        <SimpleDataTable
          columns={columns}
          emptyMessage={emptyMessage}
          errorMessage={errorMessage}
          isLoading={isLoading}
          rows={filteredRows}
        />

        <div className={`border-t px-4 py-3 text-sm ${theme.classes.tableDivider}`}>
          <p className={theme.classes.muted}>
            Showing {filteredRows.length} of {rows.length} entries
          </p>
        </div>
      </section>
    </section>
  )
}

export function SimpleDataTable({
  columns,
  emptyMessage = 'No records found.',
  errorMessage,
  isLoading = false,
  rows,
}) {
  return (
    <div className="overflow-x-auto px-4 pb-4">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className={theme.classes.tableHeader}>
          <tr>
            {columns.map(({ key, label }) => (
              <th
                className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`}
                key={key}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td
                className={`border-b px-3 py-8 text-center ${theme.classes.tableRowDivider} ${theme.classes.muted}`}
                colSpan={columns.length}
              >
                Loading records...
              </td>
            </tr>
          )}

          {!isLoading && errorMessage && (
            <tr>
              <td
                className={`border-b px-3 py-8 text-center ${theme.classes.tableRowDivider} ${theme.classes.errorText}`}
                colSpan={columns.length}
              >
                {errorMessage}
              </td>
            </tr>
          )}

          {!isLoading && !errorMessage && rows.length === 0 && (
            <tr>
              <td
                className={`border-b px-3 py-8 text-center ${theme.classes.tableRowDivider} ${theme.classes.muted}`}
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            !errorMessage &&
            rows.map((row, index) => (
              <tr
                className={`align-top transition ${theme.classes.tableRowHover}`}
                key={row.id ?? row.audit_log_id ?? row.user_id ?? index}
              >
                {columns.map(({ key }) => (
                  <td
                    className={`border-b px-3 py-3 ${theme.classes.tableRowDivider} ${theme.classes.bodyText}`}
                    key={key}
                  >
                    {formatCell(readValue(row, key))}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

function readValue(row, key) {
  return key.split('.').reduce((value, part) => value?.[part], row)
}

function formatCell(value) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => item.name || item.full_name || item.department_name || item.title || item)
      .join(', ')
  }

  if (typeof value === 'object') {
    return value.name || value.full_name || value.department_name || JSON.stringify(value)
  }

  return value
}

export default ApiListPage
