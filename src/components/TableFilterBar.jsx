import { FileDown, FileSpreadsheet, FileText, X } from 'lucide-react'
import { useState } from 'react'
import { theme } from '../theme'
import { exportCsv, exportPdf } from '../utils/tableTools'

const controlClass = `border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`
const buttonClass = `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.classes.tableToolbarButton}`

/**
 * Date-range / dropdown filters plus CSV and PDF export for a table.
 * filters: result of useTableFilters.  exportConfig: { title, columns, rows }
 * where columns are [{ label, get(row, index) }] and rows are the rows shown.
 */
function TableFilterBar({ exportConfig, filters }) {
  const [exporting, setExporting] = useState('')
  const hasDates = filters.dateKeys.length > 0
  const hasRows = exportConfig.rows.length > 0

  const runExport = async (type) => {
    setExporting(type)

    try {
      const config = { ...exportConfig, filters }

      if (type === 'csv') {
        exportCsv(config)
      } else {
        await exportPdf(config)
      }
    } finally {
      setExporting('')
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 lg:flex-row lg:flex-wrap lg:items-end">
      {hasDates && (
        <>
          {filters.dateKeys.length > 1 && (
            <FilterField label="Filter by">
              <select
                className={controlClass}
                onChange={(event) => filters.setDateKey(event.target.value)}
                value={filters.activeDateKey}
              >
                {filters.dateKeys.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </FilterField>
          )}
          <FilterField label={filters.dateKeys.length === 1 ? `${filters.dateKeys[0].label} from` : 'From'}>
            <input
              className={controlClass}
              max={filters.to || undefined}
              onChange={(event) => filters.setFrom(event.target.value)}
              type="date"
              value={filters.from}
            />
          </FilterField>
          <FilterField label="To">
            <input
              className={controlClass}
              min={filters.from || undefined}
              onChange={(event) => filters.setTo(event.target.value)}
              type="date"
              value={filters.to}
            />
          </FilterField>
          <div className="flex gap-1.5">
            {[
              ['Today', 0],
              ['7 days', 7],
              ['30 days', 30],
            ].map(([label, days]) => (
              <button
                className={buttonClass}
                key={label}
                onClick={() => filters.setRange(days)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {filters.selectOptions.map(({ key, label, options }) => (
        <FilterField key={key} label={label}>
          <select
            className={controlClass}
            onChange={(event) => filters.setSelect(key, event.target.value)}
            value={filters.selected[key] ?? ''}
          >
            <option value="">All</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FilterField>
      ))}

      {filters.isActive && (
        <button className={buttonClass} onClick={filters.clear} type="button">
          <X size={15} />
          Clear filters
        </button>
      )}

      <div className="flex gap-2 lg:ml-auto">
        <button
          className={buttonClass}
          disabled={!hasRows || Boolean(exporting)}
          onClick={() => runExport('csv')}
          type="button"
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </button>
        <button
          className={buttonClass}
          disabled={!hasRows || Boolean(exporting)}
          onClick={() => runExport('pdf')}
          type="button"
        >
          {exporting === 'pdf' ? <FileDown size={16} /> : <FileText size={16} />}
          {exporting === 'pdf' ? 'Preparing…' : 'Export PDF'}
        </button>
      </div>
    </div>
  )
}

function FilterField({ children, label }) {
  return (
    <label className="grid gap-1">
      <span className={`text-xs font-semibold ${theme.classes.subtle}`}>{label}</span>
      {children}
    </label>
  )
}

export default TableFilterBar
