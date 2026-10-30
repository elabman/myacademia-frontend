import { useMemo, useState } from 'react'

const DATE_KEY_PATTERN = /(date|_at$|At$)/

export function readPath(row, key) {
  return key.split('.').reduce((value, part) => value?.[part], row)
}

// Columns that look like dates, plus created_at when rows carry it.
export function detectDateKeys(columns, rows) {
  const dateKeys = columns.filter(({ key }) => DATE_KEY_PATTERN.test(key))

  if (
    !dateKeys.some(({ key }) => key === 'created_at') &&
    rows.some((row) => row?.created_at)
  ) {
    dateKeys.push({ key: 'created_at', label: 'Created At' })
  }

  return dateKeys
}

function parseDate(value) {
  if (!value) {
    return null
  }

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  )

  return Number.isNaN(date.getTime()) ? null : date
}

export function toDateInputValue(date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 10)
}

/**
 * Date-range and dropdown filtering shared by every table.
 * dateKeys: [{ key, label }]   selectFilters: [{ key, label }]
 */
export function useTableFilters(rows, { dateKeys = [], selectFilters = [] } = {}) {
  const [dateKey, setDateKey] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selected, setSelected] = useState({})
  const activeDateKey = dateKeys.some(({ key }) => key === dateKey)
    ? dateKey
    : dateKeys[0]?.key ?? ''

  const filteredRows = useMemo(() => {
    const start = from ? parseDate(from) : null
    const end = to ? parseDate(`${to}T23:59:59.999`) : null

    return rows.filter((row) => {
      if (activeDateKey && (start || end)) {
        const date = parseDate(readPath(row, activeDateKey))

        if (!date || (start && date < start) || (end && date > end)) {
          return false
        }
      }

      return Object.entries(selected).every(
        ([key, value]) => !value || String(readPath(row, key) ?? '') === value,
      )
    })
  }, [activeDateKey, from, rows, selected, to])

  const selectOptions = useMemo(
    () =>
      selectFilters.map(({ key, label }) => ({
        key,
        label,
        options: [
          ...new Set(
            rows
              .map((row) => readPath(row, key))
              .filter((value) => value !== undefined && value !== null && value !== '')
              .map(String),
          ),
        ].sort(),
      })),
    [rows, selectFilters],
  )

  const setRange = (days) => {
    const today = new Date()
    const start = new Date(today)

    start.setDate(today.getDate() - days)
    setFrom(toDateInputValue(start))
    setTo(toDateInputValue(today))
  }

  const clear = () => {
    setFrom('')
    setTo('')
    setSelected({})
  }

  return {
    activeDateKey,
    clear,
    dateKeys,
    filteredRows,
    from,
    isActive: Boolean(from || to || Object.values(selected).some(Boolean)),
    selectOptions,
    selected,
    setDateKey,
    setFrom,
    setRange,
    setSelect: (key, value) =>
      setSelected((current) => ({ ...current, [key]: value })),
    setTo,
    to,
  }
}

function cellText(value) {
  if (value === undefined || value === null) {
    return ''
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}

function fileName(title, extension) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${slug || 'report'}-${toDateInputValue(new Date())}.${extension}`
}

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function describeFilters(filters) {
  if (!filters) {
    return ''
  }

  const parts = []
  const dateLabel =
    filters.dateKeys.find(({ key }) => key === filters.activeDateKey)?.label ?? 'Date'

  if (filters.from || filters.to) {
    parts.push(`${dateLabel}: ${filters.from || '...'} to ${filters.to || '...'}`)
  }

  filters.selectOptions.forEach(({ key, label }) => {
    if (filters.selected[key]) {
      parts.push(`${label}: ${filters.selected[key]}`)
    }
  })

  return parts.join('  |  ')
}

// columns: [{ label, get(row, index) }]
export function exportCsv({ columns, filters, rows, title }) {
  const escape = (value) => `"${cellText(value).replace(/"/g, '""')}"`
  const lines = [
    columns.map(({ label }) => escape(label)).join(','),
    ...rows.map((row, index) =>
      columns.map(({ get }) => escape(get(row, index))).join(','),
    ),
  ]

  // BOM so Excel opens UTF-8 (emoji, accents) correctly.
  download(
    new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }),
    fileName(title, 'csv'),
  )

  return filters
}

export async function exportPdf({ columns, filters, rows, title }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({
    format: 'a4',
    orientation: columns.length > 5 ? 'landscape' : 'portrait',
    unit: 'pt',
  })
  // The built-in PDF fonts cannot draw emoji, so keep the text part only.
  const pdfText = (value) =>
    cellText(value)
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018-\u201D]/g, '')
      .trim()
  const subtitle = [
    describeFilters(filters),
    `${rows.length} records`,
    `Generated ${new Date().toLocaleString()}`,
  ]
    .filter(Boolean)
    .join('  |  ')

  doc.setFontSize(16)
  doc.text(title, 40, 42)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(subtitle, 40, 58)

  autoTable(doc, {
    body: rows.map((row, index) => [
      index + 1,
      ...columns.map(({ get }) => pdfText(get(row, index))),
    ]),
    head: [['No', ...columns.map(({ label }) => label)]],
    headStyles: { fillColor: [93, 77, 224] },
    startY: 72,
    styles: { cellPadding: 4, fontSize: 8, overflow: 'linebreak' },
  })

  doc.save(fileName(title, 'pdf'))
}
