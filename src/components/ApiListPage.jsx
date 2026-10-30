import { ArrowLeft, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { theme } from '../theme'
import { detectDateKeys, readPath, useTableFilters } from '../utils/tableTools'
import TableFilterBar from './TableFilterBar'

function ApiListPage({
  backTo,
  columns,
  emptyMessage,
  eyebrow,
  filterKeys = [],
  loadData,
  title,
}) {
  const { auth } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const dateKeys = useMemo(() => detectDateKeys(columns, rows), [columns, rows])
  const selectFilters = useMemo(
    () =>
      filterKeys.map((key) => ({
        key,
        label: columns.find((column) => column.key === key)?.label ?? key,
      })),
    [columns, filterKeys],
  )
  const filters = useTableFilters(rows, { dateKeys, selectFilters })
  const orderedRows = useMemo(
    () => sortByCreationOrder(filters.filteredRows),
    [filters.filteredRows],
  )

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
      return orderedRows
    }

    return orderedRows.filter((row) =>
      columns.some(({ key }) =>
        String(readValue(row, key)).toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [columns, orderedRows, searchTerm])

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

        <TableFilterBar
          exportConfig={{
            columns: columns
              .filter((column) => !isDatabaseIdColumn(column))
              .map(({ key, label }) => ({ get: (row) => readPath(row, key), label })),
            rows: filteredRows,
            title,
          }}
          filters={filters}
        />

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
  const visibleColumns = columns.filter((column) => !isDatabaseIdColumn(column))

  return (
    <div className="overflow-x-auto px-4 pb-4">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className={theme.classes.tableHeader}>
          <tr>
            <th className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`}>
              No
            </th>
            {visibleColumns.map(({ key, label }) => (
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
                colSpan={visibleColumns.length + 1}
              >
                Loading records...
              </td>
            </tr>
          )}

          {!isLoading && errorMessage && (
            <tr>
              <td
                className={`border-b px-3 py-8 text-center ${theme.classes.tableRowDivider} ${theme.classes.errorText}`}
                colSpan={visibleColumns.length + 1}
              >
                {errorMessage}
              </td>
            </tr>
          )}

          {!isLoading && !errorMessage && rows.length === 0 && (
            <tr>
              <td
                className={`border-b px-3 py-8 text-center ${theme.classes.tableRowDivider} ${theme.classes.muted}`}
                colSpan={visibleColumns.length + 1}
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
                <td
                  className={`border-b px-3 py-3 ${theme.classes.tableRowDivider} ${theme.classes.bodyText}`}
                >
                  {index + 1}
                </td>
                {visibleColumns.map(({ key }) => (
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

function isDatabaseIdColumn({ key, label }) {
  return key === 'id' && label === 'ID'
}

function sortByCreationOrder(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstValue = creationOrderValue(firstItem)
    const secondValue = creationOrderValue(secondItem)

    if (firstValue === secondValue) {
      return 0
    }

    return firstValue > secondValue ? 1 : -1
  })
}

function creationOrderValue(item) {
  const dateValue =
    item.created_at ||
    item.createdAt ||
    item.created_date ||
    item.createdDate ||
    item.date_created

  if (dateValue) {
    const timestamp = new Date(dateValue).getTime()

    if (!Number.isNaN(timestamp)) {
      return timestamp
    }
  }

  const numericId = Number(
    item.id ?? item.audit_log_id ?? item.user_id ?? Number.MAX_SAFE_INTEGER,
  )
  return Number.isNaN(numericId) ? Number.MAX_SAFE_INTEGER : numericId
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
