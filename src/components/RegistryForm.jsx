import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { countryOptions } from '../data/countries'
import { theme } from '../theme'

function RegistryForm({
  backTo,
  errorMessage,
  fields,
  initialValues = {},
  isSubmitting = false,
  onSubmit,
  selectOptions = {},
  submitLabel = 'Save',
  subtitle = 'Fill the registry details. This form is separate from the table view.',
  title,
}) {
  const [participantCounts, setParticipantCounts] = useState({
    female: initialValue(initialValues, 'female'),
    male: initialValue(initialValues, 'male'),
  })
  const [projectDates, setProjectDates] = useState({
    endDate: inputDateValue(initialValue(initialValues, 'endDate')),
    expiryDate: inputDateValue(initialValue(initialValues, 'expiryDate')),
    effectiveDate: inputDateValue(initialValue(initialValues, 'effectiveDate')),
    startDate: inputDateValue(initialValue(initialValues, 'startDate')),
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = Object.fromEntries(formData.entries())

    await onSubmit(values)
  }

  const formRows = createFormRows(fields.slice(1))
  const totalParticipants = useMemo(
    () => numberFrom(participantCounts.female) + numberFrom(participantCounts.male),
    [participantCounts],
  )
  const durationMonths = useMemo(
    () => calculateDurationMonths(projectDates.startDate, projectDates.endDate),
    [projectDates],
  )
  const mouDurationLabel = useMemo(
    () =>
      calculateDurationLabel(projectDates.effectiveDate, projectDates.expiryDate),
    [projectDates],
  )

  return (
    <section className="space-y-4">
      <section
        className={`rounded-2xl border p-4 sm:p-5 ${theme.classes.dashboardSurface}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
              Registry Form
            </p>
            <h2 className={`mt-1 text-lg font-bold ${theme.classes.heading}`}>
              {title}
            </h2>
            <p className={`mt-1 max-w-2xl text-sm ${theme.classes.muted}`}>
              {subtitle}
            </p>
          </div>
          <Link
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${theme.classes.socialButton}`}
            to={backTo}
          >
            Back to table
          </Link>
        </div>
      </section>

      {errorMessage && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}
        >
          {errorMessage}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <section
          className={`overflow-hidden rounded-2xl border ${theme.classes.dashboardSurface}`}
        >
          <div
            className={`border-b px-4 py-3 text-sm font-semibold ${theme.classes.formBar}`}
          >
            Form Details
          </div>

          <div className="px-4 py-3">
            {formRows.map((row) => (
              <FormRow
                fields={row}
                durationMonths={durationMonths}
                isSubmitting={isSubmitting}
                initialValues={initialValues}
                key={row.map(([key]) => key).join('-')}
                mouDurationLabel={mouDurationLabel}
                onParticipantChange={setParticipantCounts}
                onProjectDateChange={setProjectDates}
                participantCounts={participantCounts}
                projectDates={projectDates}
                selectOptions={selectOptions}
                totalParticipants={totalParticipants}
              />
            ))}
          </div>
        </section>

        <div
          className={`sticky bottom-0 z-10 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between ${theme.classes.dashboardSurface}`}
        >
          <div>
            <p className={`text-sm font-semibold ${theme.classes.heading}`}>
              Ready to save?
            </p>
            <p className={`text-xs ${theme.classes.muted}`}>
              Review the information before submitting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
              to={backTo}
            >
              Cancel
            </Link>
            <button
              disabled={isSubmitting}
              type="submit"
              className={`rounded-lg px-5 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${theme.classes.primaryButton}`}
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}

function FormRow({
  durationMonths,
  fields,
  isSubmitting,
  initialValues,
  mouDurationLabel,
  onParticipantChange,
  onProjectDateChange,
  participantCounts,
  projectDates,
  selectOptions,
  totalParticipants,
}) {
  const rowLabel = fields.map(([, label]) => label).join(' / ')

  return (
    <div
      className={`grid gap-2 border-b py-2.5 last:border-b-0 md:grid-cols-[220px_1fr] md:items-start ${theme.classes.tableRowDivider}`}
    >
      <span
        className={`pt-2 text-xs font-semibold uppercase md:text-right ${theme.classes.label}`}
      >
        {rowLabel}
      </span>
      <div
        className={`grid min-w-0 gap-3 ${
          fields.length > 1 ? 'sm:grid-cols-2' : ''
        }`}
      >
        {fields.map(([key, label]) => (
          <FormField
            compact={fields.length > 1}
            durationMonths={durationMonths}
            isSubmitting={isSubmitting}
            initialValues={initialValues}
            mouDurationLabel={mouDurationLabel}
            key={key}
            label={label}
            name={key}
            onParticipantChange={onParticipantChange}
            onProjectDateChange={onProjectDateChange}
            participantCounts={participantCounts}
            projectDates={projectDates}
            selectOptions={selectOptions}
            totalParticipants={totalParticipants}
          />
        ))}
      </div>
    </div>
  )
}

function FormField({
  durationMonths,
  isSubmitting,
  initialValues,
  label,
  mouDurationLabel,
  name,
  onParticipantChange,
  onProjectDateChange,
  participantCounts,
  projectDates,
  selectOptions,
  totalParticipants,
}) {
  const config = fieldConfig(name, selectOptions)
  const isParticipantInput = name === 'female' || name === 'male'
  const isProjectDateInput =
    name === 'startDate' ||
    name === 'endDate' ||
    name === 'effectiveDate' ||
    name === 'expiryDate'
  const isReadonlyDuration = name === 'duration'
  const isReadonlyMouDuration = name === 'durationLabel'
  const isReadonlyTotal = name === 'total'
  const inputType = fieldType(name)
  const defaultValue =
    inputType === 'date'
      ? inputDateValue(initialValue(initialValues, name))
      : initialValue(initialValues, name)

  return (
    <div className="grid gap-1.5">
      <span className={`text-xs font-semibold ${theme.classes.subtle}`}>
        {label}
      </span>
      {config.searchableOptions ? (
        <SearchableSelect
          defaultValue={defaultValue}
          disabled={isSubmitting}
          label={label}
          name={name}
          options={config.searchableOptions}
        />
      ) : config.options ? (
        <select
          className={`w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
          defaultValue={defaultValue}
          disabled={isSubmitting}
          name={name}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {config.options.length === 0 && (
            <option disabled value="">{`No ${label.toLowerCase()} options available`}</option>
          )}
          {config.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : config.multiline ? (
        <textarea
          className={`min-h-20 w-full resize-y border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
          defaultValue={defaultValue}
          disabled={isSubmitting}
          name={name}
          rows={3}
        />
      ) : (
        <input
          className={`w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
          disabled={isSubmitting}
          name={name}
          onChange={
            isParticipantInput
              ? (event) =>
                  onParticipantChange((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))
              : isProjectDateInput
                ? (event) =>
                    onProjectDateChange((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
              : undefined
          }
          readOnly={isReadonlyTotal || isReadonlyDuration || isReadonlyMouDuration}
          type={inputType}
          value={
            isParticipantInput
              ? participantCounts[name]
              : isProjectDateInput
                ? projectDates[name]
              : isReadonlyTotal
                ? totalParticipants
                : isReadonlyDuration
                ? durationMonths
                : isReadonlyMouDuration
                  ? mouDurationLabel
                : undefined
          }
          defaultValue={
            isParticipantInput ||
            isProjectDateInput ||
            isReadonlyTotal ||
            isReadonlyDuration ||
            isReadonlyMouDuration
              ? undefined
              : defaultValue
          }
        />
      )}
      {config.hint && (
        <span className={`text-xs ${theme.classes.subtle}`}>{config.hint}</span>
      )}
    </div>
  )
}

function SearchableSelect({ defaultValue, disabled, label, name, options }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedValue, setSelectedValue] = useState(defaultValue || '')
  const selectedOption = options.find(
    (option) => String(option.value) === String(selectedValue),
  )
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  )

  const handleSelect = (value) => {
    setSelectedValue(value)
    setSearchTerm('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <input name={name} type="hidden" value={selectedValue} />
      <button
        className={`flex w-full items-center justify-between border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${theme.classes.formControl}`}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={selectedValue ? theme.classes.bodyText : theme.classes.subtle}>
          {selectedOption?.label || `Select ${label.toLowerCase()}`}
        </span>
        <span className={theme.classes.subtle}>v</span>
      </button>

      {isOpen && (
        <div
          className={`absolute z-30 mt-1 w-full overflow-hidden rounded-xl border ${theme.classes.modalPanel}`}
        >
          <div className={`border-b p-2 ${theme.classes.tableDivider}`}>
            <input
              autoFocus
              className={`w-full border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${theme.classes.tableSearch}`}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              type="search"
              value={searchTerm}
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className={`px-3 py-2 text-sm ${theme.classes.muted}`}>
                No countries found.
              </p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    String(option.value) === String(selectedValue)
                      ? theme.classes.dashboardNavActive
                      : `${theme.classes.bodyText} hover:bg-slate-50`
                  }`}
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function createFormRows(fieldEntries) {
  const pairGroups = [
    ['partner', 'partnerType'],
    ['contactPerson', 'contactPosition'],
    ['contactEmail', 'contactPhone'],
    ['dateSigned', 'effectiveDate'],
    ['expiryDate', 'lastReviewDate'],
    ['department', 'status'],
    ['renewalRequired', 'progressStatus'],
    ['startDate', 'endDate'],
    ['days', 'hours'],
    ['female', 'male'],
    ['total', 'certified'],
    ['fee', 'revenue'],
    ['budgetUsd', 'budgetRwf'],
    ['collegeContribution', 'donorContribution'],
    ['beneficiaryType', 'beneficiaries'],
    ['fundingType', 'sector'],
    ['level', 'mode'],
    ['department', 'category'],
  ]
  const fieldsByKey = new Map(fieldEntries)
  const usedKeys = new Set()
  const rows = []

  fieldEntries.forEach(([key, label]) => {
    if (usedKeys.has(key)) {
      return
    }

    const pair = pairGroups.find((group) => group[0] === key || group[1] === key)

    if (pair?.every((pairKey) => fieldsByKey.has(pairKey))) {
      rows.push(pair.map((pairKey) => [pairKey, fieldsByKey.get(pairKey)]))
      pair.forEach((pairKey) => usedKeys.add(pairKey))
      return
    }

    rows.push([[key, label]])
    usedKeys.add(key)
  })

  return rows
}

function fieldConfig(key, selectOptions = {}) {
  const databaseOptions = selectOptions[key]
  const relationshipFields = [
    'category',
    'collaborationArea',
    'department',
    'departments',
    'donor',
    'fundingType',
    'mode',
    'partner',
    'partnerType',
    'progressStatus',
    'renewalRequired',
    'sector',
  ]
  const options = {
    language: staticOptions(['English', 'Kinyarwanda', 'English/Kinyarwanda', 'French']),
    level: staticOptions(['Beginner', 'Intermediate', 'Advanced']),
    status: staticOptions(['Planning', 'Pipeline', 'Active', 'Completed']),
  }

  const multilineFields = [
    'title',
    'partners',
    'departments',
    'audience',
    'deliverables',
    'nextAction',
    'objectives',
    'prerequisites',
    'certification',
    'accreditation',
    'kpi',
    'remarks',
  ]

  const hints = {
    achievement: 'Enter a number only. Example: 64',
    category: 'Select appears when category IDs are returned by the short-course list.',
    duration: 'Calculated from start date and end date.',
    fundingType: 'Select appears when funding type IDs are returned by the project list.',
    mode: 'Select appears when delivery mode IDs are returned by the short-course list.',
    total: 'Calculated from female and male participants.',
  }

  return {
    hint: hints[key],
    multiline: multilineFields.includes(key),
    options: databaseOptions?.length
      ? databaseOptions
      : relationshipFields.includes(key)
        ? []
        : options[key],
    searchableOptions: key === 'country' ? countryOptions : undefined,
  }
}

function staticOptions(values) {
  return values.map((value) => ({ label: value, value }))
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

function numberFrom(value) {
  const numericValue = Number(String(value || 0).replaceAll(',', ''))
  return Number.isNaN(numericValue) ? 0 : numericValue
}

function initialValue(values, key) {
  const valueToUse = values?.[key]

  if (valueToUse === undefined || valueToUse === null || valueToUse === '-') {
    return ''
  }

  return valueToUse
}

function inputDateValue(dateValue) {
  if (!dateValue) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue))) {
    return dateValue
  }

  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toISOString().slice(0, 10)
}

function calculateDurationMonths(startDate, endDate) {
  if (!startDate || !endDate) {
    return ''
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return ''
  }

  const yearMonths = (end.getFullYear() - start.getFullYear()) * 12
  const monthDifference = end.getMonth() - start.getMonth()
  const dayAdjustment = end.getDate() >= start.getDate() ? 1 : 0

  return Math.max(yearMonths + monthDifference + dayAdjustment, 1)
}

function calculateDurationLabel(startDate, endDate) {
  const months = calculateDurationMonths(startDate, endDate)

  if (!months) {
    return ''
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const parts = []

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`)
  }

  if (remainingMonths > 0) {
    parts.push(
      `${remainingMonths} ${remainingMonths === 1 ? 'Month' : 'Months'}`,
    )
  }

  return parts.join(' ')
}

export default RegistryForm
