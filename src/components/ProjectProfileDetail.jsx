import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Flag,
  Pencil,
  Target,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { theme } from '../theme'

function ProjectProfileDetail({
  backTo,
  editTo,
  errorMessage,
  isDeleting = false,
  isLoading = false,
  onDelete,
  project,
}) {
  if (isLoading || errorMessage || !project) {
    return (
      <section
        className={`rounded-2xl border p-6 ${theme.classes.dashboardSurface}`}
      >
        <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
          {isLoading
            ? 'Loading project'
            : errorMessage
              ? 'Could not load project'
              : 'Project not found'}
        </h2>
        <p className={`mt-2 text-sm ${theme.classes.muted}`}>
          {isLoading
            ? 'Please wait while the project profile is loaded.'
            : errorMessage || 'The selected project could not be found.'}
        </p>
        <DetailActions
          backTo={backTo}
          editTo={editTo}
          isDeleting={isDeleting}
          onDelete={onDelete}
        />
      </section>
    )
  }

  const budgetUsd = numberFrom(project.budgetUsd)
  const donorUsd = numberFrom(project.donorContribution)
  const collegeRwf = numberFrom(project.collegeContribution)
  const donorShare = budgetUsd > 0 ? Math.min((donorUsd / budgetUsd) * 100, 100) : 0

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            Project Profile
          </p>
          <h2 className={`mt-1 max-w-5xl text-xl font-bold ${theme.classes.heading}`}>
            {project.title}
          </h2>
        </div>
        <DetailActions
          backTo={backTo}
          editTo={editTo}
          isDeleting={isDeleting}
          onDelete={onDelete}
        />
      </div>

      <section className={`rounded-2xl border ${theme.classes.dashboardSurface}`}>
        <div className={`border-l-4 p-4 sm:p-5 ${theme.classes.tableAccent}`}>
          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                <span className={`text-sm ${theme.classes.muted}`}>
                  S/N {project.sn || '-'}
                </span>
              </div>

              <h3 className={`mt-3 text-base font-bold ${theme.classes.heading}`}>
                {project.donor || 'Donor not listed'}
              </h3>
              <p className={`mt-1 max-w-3xl text-sm leading-6 ${theme.classes.muted}`}>
                {project.sector || '-'} project coordinated by{' '}
                <span className={theme.classes.heading}>
                  {project.coordinator || '-'}
                </span>
                .
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric
                  icon={CalendarDays}
                  label="Timeline"
                  value={`${project.startDate || '-'} - ${project.endDate || '-'}`}
                />
                <SummaryMetric
                  icon={Banknote}
                  label="Budget USD"
                  value={project.budgetUsd}
                />
                <SummaryMetric
                  icon={UsersRound}
                  label="Beneficiaries"
                  value={project.beneficiaries}
                />
                <SummaryMetric
                  icon={Flag}
                  label="Funding Type"
                  value={project.fundingType}
                />
              </div>

              <div className="mt-4 grid gap-x-6 gap-y-2 md:grid-cols-2">
                <CompactPair label="Coordinator" value={project.coordinator} />
                <CompactPair label="Partners" value={project.partners} />
                <CompactPair label="Departments" value={project.departments} />
                <CompactPair label="Scope" value={project.scope} />
              </div>
            </div>

            <aside className={`rounded-xl border p-4 ${theme.classes.dashboardInfoPanel}`}>
              <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
                Funding Mix
              </p>
              <p className={`mt-1 text-2xl font-bold ${theme.classes.heading}`}>
                {Math.round(donorShare)}%
              </p>
              <p className={`mt-1 text-sm ${theme.classes.muted}`}>
                Donor contribution against total USD budget
              </p>
              <div
                className={`mt-4 h-2 overflow-hidden rounded-full ${theme.classes.progressTrack}`}
              >
                <div
                  className={`h-full rounded-full ${theme.classes.progressFill}`}
                  style={{ width: `${donorShare}%` }}
                />
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <CompactPair label="Total Budget USD" value={project.budgetUsd} />
                <CompactPair label="Total Budget RWF" value={project.budgetRwf} />
                <CompactPair label="Donor USD" value={project.donorContribution} />
                <CompactPair
                  label="College RWF"
                  value={collegeRwf ? project.collegeContribution : '-'}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <DetailSection
          icon={CircleDollarSign}
          title="Funding"
          fields={[
            ['Total Budget (USD)', project.budgetUsd],
            ['Total Budget (RWF)', project.budgetRwf],
            ['Donor Contribution (USD)', project.donorContribution],
            ['College/RP Contribution (RWF)', project.collegeContribution],
          ]}
        />

        <DetailSection
          icon={CalendarDays}
          title="Timeline"
          fields={[
            ['Start Date', project.startDate],
            ['End Date', project.endDate],
            ['Duration', `${project.duration || '-'} months`],
            ['Overall Status', project.status],
          ]}
        />

        <DetailSection
          icon={Target}
          title="Beneficiaries and Performance"
          fields={[
            ['Beneficiary Type', project.beneficiaryType],
            ['No. of Direct Beneficiaries', project.beneficiaries],
            ['Key Performance Indicator', project.kpi],
            ['Achievement Rate (%)', project.achievement],
          ]}
        />
      </div>

      <section
        className={`rounded-2xl border p-4 ${theme.classes.dashboardSurface}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.classes.dashboardIconReports}`}
          >
            <FileText size={18} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${theme.classes.heading}`}>
              Remarks and Constraints
            </h3>
            <p className={`text-sm ${theme.classes.muted}`}>
              Notes captured against this project record.
            </p>
          </div>
        </div>
        <p className={`mt-5 text-sm leading-6 ${theme.classes.bodyText}`}>
          {project.remarks || '-'}
        </p>
      </section>
    </section>
  )
}

function DetailActions({ backTo, editTo, isDeleting, onDelete }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
        to={backTo}
      >
        <ArrowLeft size={16} />
        Back to table
      </Link>
      {editTo && (
        <Link
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
          to={editTo}
        >
          <Pencil size={16} />
          Edit
        </Link>
      )}
      {onDelete && (
        <button
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.classes.dangerButton}`}
          disabled={isDeleting}
          onClick={onDelete}
          type="button"
        >
          <Trash2 size={16} />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </div>
  )
}

function SummaryMetric({ icon: Icon, label, value }) {
  return (
    <article className={`rounded-xl border p-3 ${theme.classes.dashboardInset}`}>
      <div
        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${theme.classes.dashboardIconMessages}`}
      >
        <Icon size={16} />
      </div>
      <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${theme.classes.heading}`}>
        {value || '-'}
      </p>
    </article>
  )
}

function DetailSection({ fields, icon: Icon, title }) {
  return (
    <section
      className={`rounded-2xl border p-4 ${theme.classes.dashboardSurface}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.classes.dashboardIconUsers}`}
        >
          <Icon size={18} />
        </div>
        <h3 className={`text-sm font-bold ${theme.classes.heading}`}>{title}</h3>
      </div>
      <div className="mt-4 grid gap-2">
        {fields.map(([label, value]) => (
          <CompactPair key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  )
}

function CompactPair({ label, value }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b py-2 last:border-b-0 ${theme.classes.tableRowDivider}`}>
      <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
        {label}
      </p>
      <p className={`max-w-[60%] text-right text-sm font-medium ${theme.classes.bodyText}`}>
        {value || '-'}
      </p>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(status)}`}
    >
      {status || '-'}
    </span>
  )
}

function statusClass(status) {
  const normalizedStatus = String(status).toLowerCase()

  if (normalizedStatus.includes('active')) {
    return theme.classes.statusActive
  }

  if (normalizedStatus.includes('pipeline')) {
    return theme.classes.statusPipeline
  }

  if (normalizedStatus.includes('completed')) {
    return theme.classes.statusCompleted
  }

  if (normalizedStatus.includes('planning')) {
    return theme.classes.statusPlanning
  }

  return theme.classes.dashboardMutedSurface
}

function numberFrom(value) {
  const numericValue = Number(String(value || 0).replaceAll(',', ''))
  return Number.isNaN(numericValue) ? 0 : numericValue
}

export default ProjectProfileDetail
