import { ArrowLeft, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { theme } from '../theme'

function MasterDataPage({
  backTo,
  columns,
  createRecord,
  deleteRecord,
  emptyMessage,
  eyebrow,
  fields,
  idKeys = ['id'],
  listRecords,
  title,
  updateRecord,
}) {
  const { auth } = useAuth()
  const [deletingId, setDeletingId] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [records, setRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const orderedRecords = useMemo(() => sortByCreationOrder(records), [records])

  const loadRecords = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      setRecords(await listRecords(auth.accessToken))
    } catch (error) {
      setErrorMessage(error.message)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken, listRecords])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadRecords, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadRecords])

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return orderedRecords
    }

    return orderedRecords.filter((record) =>
      columns.some(({ key }) =>
        String(readValue(record, key)).toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [columns, orderedRecords, searchTerm])
  const visibleColumns = columns.filter((column) => !isDatabaseIdColumn(column))

  const openCreateForm = () => {
    setEditingRecord(null)
    setIsFormOpen(true)
  }

  const openEditForm = (record) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }

  const handleSubmit = async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      if (editingRecord) {
        await updateRecord(
          auth.accessToken,
          recordId(editingRecord, idKeys),
          normalizePayload(values, fields),
        )
      } else {
        await createRecord(auth.accessToken, normalizePayload(values, fields))
      }

      setEditingRecord(null)
      setIsFormOpen(false)
      await loadRecords()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (record) => {
    const id = recordId(record, idKeys)
    const name = displayName(record, visibleColumns)

    if (!window.confirm(`Delete "${name}"?`)) {
      return
    }

    setErrorMessage('')
    setDeletingId(id)

    try {
      await deleteRecord(auth.accessToken, id)
      setRecords((currentRecords) =>
        currentRecords.filter((item) => String(recordId(item, idKeys)) !== String(id)),
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setDeletingId(null)
    }
  }

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
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
            onClick={openCreateForm}
            type="button"
          >
            <Plus size={17} />
            Add {singularTitle(title)}
          </button>
        </div>
      </div>

      {errorMessage && (
        <section
          className={`rounded-2xl border p-4 text-sm ${theme.classes.errorBox}`}
        >
          {errorMessage}
        </section>
      )}

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

          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            onClick={loadRecords}
            type="button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className={theme.classes.tableHeader}>
              <tr>
                <th className={`whitespace-nowrap px-3 py-3 text-xs font-semibold ${theme.classes.label}`}>
                  Actions
                </th>
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
                <TableMessage
                  colSpan={visibleColumns.length + 2}
                  message={`Loading ${title.toLowerCase()}...`}
                />
              )}

              {!isLoading && filteredRecords.length === 0 && (
                <TableMessage
                  colSpan={visibleColumns.length + 2}
                  message={emptyMessage}
                />
              )}

              {!isLoading &&
                filteredRecords.map((record, index) => {
                  const id = recordId(record, idKeys) ?? index

                  return (
                    <tr
                      className={`align-top transition ${theme.classes.tableRowHover}`}
                      key={id}
                    >
                      <td className={`border-b px-3 py-3 ${theme.classes.tableRowDivider}`}>
                        <div className="flex items-center gap-1.5">
                          <button
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${theme.classes.tableToolbarButton}`}
                            onClick={() => openEditForm(record)}
                            title="Edit"
                            type="button"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.classes.dangerButton}`}
                            disabled={String(deletingId) === String(id)}
                            onClick={() => handleDelete(record)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
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
                          {formatCell(readValue(record, key))}
                        </td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        <div className={`border-t px-4 py-3 text-sm ${theme.classes.tableDivider}`}>
          <p className={theme.classes.muted}>
            Showing {filteredRecords.length} of {records.length} entries
          </p>
        </div>
      </section>

      {isFormOpen && (
        <MasterDataFormModal
          fields={fields}
          isSubmitting={isSubmitting}
          onClose={() => {
            setEditingRecord(null)
            setIsFormOpen(false)
          }}
          onSubmit={handleSubmit}
          record={editingRecord}
          title={title}
        />
      )}
    </section>
  )
}

function MasterDataFormModal({
  fields,
  isSubmitting,
  onClose,
  onSubmit,
  record,
  title,
}) {
  const isEditing = Boolean(record)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(Object.fromEntries(new FormData(event.currentTarget).entries()))
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme.classes.modalOverlay}`}
    >
      <section
        className={`w-full max-w-2xl overflow-hidden rounded-2xl border ${theme.classes.modalPanel}`}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${theme.classes.tableDivider}`}
        >
          <div>
            <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
              {isEditing ? `Edit ${singularTitle(title)}` : `Add ${singularTitle(title)}`}
            </h2>
            <p className={`mt-1 text-sm ${theme.classes.muted}`}>
              Manage this master-data record.
            </p>
          </div>
          <button
            aria-label="Close form"
            className={`rounded-xl p-2 transition ${theme.classes.icon} ${theme.classes.iconHover}`}
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {fields.map((field) => (
              <label className="grid gap-1.5" key={field.name}>
                <span className={`text-xs font-semibold ${theme.classes.subtle}`}>
                  {field.label}
                </span>
                {field.type === 'select' ? (
                  <select
                    className={`w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
                    defaultValue={String(readValue(record, field.name) ?? field.defaultValue ?? '')}
                    name={field.name}
                    required={field.required}
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options.map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
                    defaultValue={readValue(record, field.name) ?? field.defaultValue ?? ''}
                    name={field.name}
                    required={field.required}
                    type={field.type || 'text'}
                  />
                )}
              </label>
            ))}
          </div>

          <div
            className={`flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-end ${theme.classes.tableDivider}`}
          >
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${theme.classes.primaryButton}`}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function TableMessage({ colSpan, message }) {
  return (
    <tr>
      <td
        className={`border-b px-3 py-8 text-center ${theme.classes.tableRowDivider} ${theme.classes.muted}`}
        colSpan={colSpan}
      >
        {message}
      </td>
    </tr>
  )
}

function normalizePayload(values, fields) {
  return Object.fromEntries(
    fields
      .map((field) => [
        field.name,
        field.type === 'number'
          ? numberOrValue(values[field.name])
          : booleanOrValue(values[field.name]),
      ])
      .filter(([, value]) => value !== undefined && value !== ''),
  )
}

function booleanOrValue(value) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}

function numberOrValue(value) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? value : numericValue
}

function recordId(record, idKeys) {
  return idKeys.map((key) => readValue(record, key)).find(Boolean)
}

function readValue(record, key) {
  return key.split('.').reduce((value, part) => value?.[part], record)
}

function formatCell(value) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return value
}

function displayName(record, columns) {
  const column = columns.find(({ key }) => key !== 'id')
  return readValue(record, column?.key || 'id') || 'record'
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

  const numericId = Number(item.id ?? Number.MAX_SAFE_INTEGER)
  return Number.isNaN(numericId) ? Number.MAX_SAFE_INTEGER : numericId
}

function singularTitle(title) {
  if (title === 'Academic Years') {
    return 'Academic Year'
  }

  return title.endsWith('s') ? title.slice(0, -1) : title
}

export default MasterDataPage
