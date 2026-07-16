import { Link } from 'react-router-dom'
import {
  Download,
  Eye,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { theme } from '../theme'

function RegistryTable({ addTo, columns, eyebrow, quickColumns, rows, title }) {
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const defaultVisibleColumns =
    quickColumns ?? columns.slice(0, 8).map(([key]) => key)
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns)
  const quickColumnEntries = columns.filter(([key]) => visibleColumns.includes(key))

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return rows
    }

    return rows.filter((row) =>
      columns.some(([key]) =>
        String(row[key] ?? '')
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    )
  }, [columns, rows, searchTerm])

  return (
    <section>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>{title}</h2>
          <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            {eyebrow}
          </p>
        </div>
        <Link
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
          to={addTo}
        >
          <Plus size={17} />
          Add New
        </Link>
      </div>

      <section
        className={`border-t-4 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}
      >
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-wrap gap-2">
            <button
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              type="button"
            >
              <Download size={16} />
              Export this page
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              type="button"
            >
              <Download size={16} />
              Export all pages
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              onClick={() => setIsColumnModalOpen(true)}
              type="button"
            >
              <SlidersHorizontal size={16} />
              Show/Hide Columns
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className={theme.classes.tableHeader}>
              <tr>
                <th className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`}>
                  View
                </th>
                {quickColumnEntries.map(([, label]) => (
                  <th
                    className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`}
                    key={label}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  className={`align-top transition ${theme.classes.tableRowHover}`}
                  key={row.sn}
                >
                  <td className={`border-b px-3 py-3 ${theme.classes.tableRowDivider}`}>
                    <Link
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${theme.classes.tableToolbarButton}`}
                      aria-label="View details"
                      to={`${row.sn}`}
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                  {quickColumnEntries.map(([key]) => (
                    <td
                      className={`border-b px-3 py-3 ${
                        key === 'title' ? 'min-w-72 font-medium' : 'whitespace-nowrap'
                      } ${theme.classes.tableRowDivider} ${theme.classes.bodyText}`}
                      key={key}
                    >
                      {key === 'status' ? (
                        <StatusPill value={row[key]} />
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${theme.classes.tableDivider}`}>
          <p className={theme.classes.muted}>
            Showing {filteredRows.length} of {rows.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              className={`rounded-lg border px-3 py-2 ${theme.classes.tableToolbarButton}`}
              type="button"
            >
              Previous
            </button>
            <span
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${theme.classes.primaryButton}`}
            >
              1
            </span>
            <button
              className={`rounded-lg border px-3 py-2 ${theme.classes.tableToolbarButton}`}
              type="button"
            >
              Next
            </button>
          </div>
        </div>

        <div className={`border-t p-4 text-sm ${theme.classes.tableDivider}`}>
          <p className={theme.classes.muted}>
            Quick columns are shown first. Use the view button to open a full
            record page with all registry fields.
          </p>
        </div>
      </section>

      {isColumnModalOpen && (
        <ColumnSelectorModal
          columns={columns}
          defaultVisibleColumns={defaultVisibleColumns}
          onClose={() => setIsColumnModalOpen(false)}
          onUpdate={setVisibleColumns}
          title={title}
          visibleColumns={visibleColumns}
        />
      )}
    </section>
  )
}

function ColumnSelectorModal({
  columns,
  defaultVisibleColumns,
  onClose,
  onUpdate,
  title,
  visibleColumns,
}) {
  const [draftColumns, setDraftColumns] = useState(visibleColumns)

  const toggleColumn = (key) => {
    setDraftColumns((currentColumns) => {
      if (currentColumns.includes(key)) {
        return currentColumns.filter((columnKey) => columnKey !== key)
      }

      return [...currentColumns, key]
    })
  }

  const applyColumns = () => {
    onUpdate(draftColumns.length > 0 ? draftColumns : [columns[0][0]])
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.classes.modalOverlay}`}
    >
      <section
        className={`w-full max-w-3xl overflow-hidden rounded-2xl border ${theme.classes.modalPanel}`}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${theme.classes.tableDivider}`}
        >
          <div>
            <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
              Show/Hide Columns
            </h2>
            <p className={`mt-1 text-sm ${theme.classes.muted}`}>
              Choose the fields shown in the {title.toLowerCase()} table.
            </p>
          </div>
          <button
            type="button"
            className={`rounded-xl p-2 transition ${theme.classes.icon} ${theme.classes.iconHover}`}
            onClick={onClose}
            aria-label="Close column selector"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map(([key, label]) => (
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${theme.classes.tableToolbarButton}`}
                key={key}
              >
                <input
                  checked={draftColumns.includes(key)}
                  className={`mt-0.5 h-4 w-4 rounded ${theme.classes.checkbox}`}
                  onChange={() => toggleColumn(key)}
                  type="checkbox"
                />
                <span className={theme.classes.bodyText}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div
          className={`flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between ${theme.classes.tableDivider}`}
        >
          <p className={`text-sm ${theme.classes.muted}`}>
            {draftColumns.length} of {columns.length} fields selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              onClick={() => setDraftColumns(defaultVisibleColumns)}
            >
              Reset
            </button>
            <button
              type="button"
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              onClick={() => setDraftColumns(columns.map(([key]) => key))}
            >
              Select all
            </button>
            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
              onClick={applyColumns}
            >
              Apply Columns
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatusPill({ value }) {
  const normalizedValue = String(value).toLowerCase()
  const statusClass = normalizedValue.includes('active')
    ? theme.classes.statusActive
    : normalizedValue.includes('pipeline')
      ? theme.classes.statusPipeline
      : normalizedValue.includes('planning')
        ? theme.classes.statusPlanning
        : theme.classes.statusCompleted

  return (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
      {value}
    </span>
  )
}

export default RegistryTable
