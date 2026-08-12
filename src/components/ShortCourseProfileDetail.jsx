import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  Clock3,
  Languages,
  Pencil,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { theme } from '../theme'

function ShortCourseProfileDetail({
  backTo,
  course,
  editTo,
  errorMessage,
  isDeleting = false,
  isLoading = false,
  onDelete,
}) {
  if (isLoading || errorMessage || !course) {
    return (
      <section
        className={`rounded-2xl border p-6 ${theme.classes.dashboardSurface}`}
      >
        <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
          {isLoading
            ? 'Loading short course'
            : errorMessage
              ? 'Could not load short course'
              : 'Short course not found'}
        </h2>
        <p className={`mt-2 text-sm ${theme.classes.muted}`}>
          {isLoading
            ? 'Please wait while the short-course profile is loaded.'
            : errorMessage || 'The selected short course could not be found.'}
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

  const female = numberFrom(course.female)
  const male = numberFrom(course.male)
  const total = numberFrom(course.total)
  const certified = numberFrom(course.certified)
  const certifiedShare = total > 0 ? Math.min((certified / total) * 100, 100) : 0
  const femaleShare = total > 0 ? Math.min((female / total) * 100, 100) : 0
  const maleShare = total > 0 ? Math.min((male / total) * 100, 100) : 0

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            Short Course Profile
          </p>
          <h2 className={`mt-1 max-w-5xl text-xl font-bold ${theme.classes.heading}`}>
            {course.title}
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
                <StatusBadge status={course.status} />
              </div>

              <h3 className={`mt-3 text-base font-bold ${theme.classes.heading}`}>
                {course.department || 'Department not listed'}
              </h3>
              <p className={`mt-1 max-w-3xl text-sm leading-6 ${theme.classes.muted}`}>
                {course.level || '-'} {course.category || '-'} training delivered
                through {course.mode || '-'} mode for {course.audience || '-'}.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric
                  icon={Clock3}
                  label="Duration"
                  value={`${course.days || '-'} days / ${course.hours || '-'} hours`}
                />
                <SummaryMetric
                  icon={UsersRound}
                  label="Participants"
                  value={course.total}
                />
                <SummaryMetric
                  icon={Award}
                  label="Certified"
                  value={course.certified}
                />
                <SummaryMetric
                  icon={Languages}
                  label="Language"
                  value={course.language}
                />
              </div>

              <div className="mt-4 grid gap-x-6 gap-y-2 md:grid-cols-2">
                <CompactPair label="Coordinator" value={course.coordinator} />
                <CompactPair label="Prerequisites" value={course.prerequisites} />
                <CompactPair label="Certification" value={course.certification} />
                <CompactPair label="Accreditation" value={course.accreditation} />
              </div>
            </div>

            <aside className={`rounded-xl border p-4 ${theme.classes.dashboardInfoPanel}`}>
              <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
                Certification Progress
              </p>
              <p className={`mt-1 text-2xl font-bold ${theme.classes.heading}`}>
                {Math.round(certifiedShare)}%
              </p>
              <p className={`mt-1 text-sm ${theme.classes.muted}`}>
                {formatNumber(certified)} certified from {formatNumber(total)} participants
              </p>
              <div
                className={`mt-4 h-2 overflow-hidden rounded-full ${theme.classes.progressTrack}`}
              >
                <div
                  className={`h-full rounded-full ${theme.classes.progressFill}`}
                  style={{ width: `${certifiedShare}%` }}
                />
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <CompactPair
                  label="Female"
                  value={`${course.female || '-'} (${Math.round(femaleShare)}%)`}
                />
                <CompactPair
                  label="Male"
                  value={`${course.male || '-'} (${Math.round(maleShare)}%)`}
                />
                <CompactPair label="Fee / Participant" value={course.fee} />
                <CompactPair label="Expected Revenue" value={course.revenue} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <DetailSection
          icon={BookOpenCheck}
          title="Course Setup"
          fields={[
            ['Department', course.department],
            ['Category', course.category],
            ['Level', course.level],
            ['Delivery Mode', course.mode],
          ]}
        />

        <DetailSection
          icon={Clock3}
          title="Duration and Delivery"
          fields={[
            ['Duration (Days)', course.days],
            ['Duration (Hours)', course.hours],
            ['Language', course.language],
            ['Prerequisites', course.prerequisites],
          ]}
        />

        <DetailSection
          icon={UsersRound}
          title="Participants"
          fields={[
            ['Target Audience', course.audience],
            ['Participants (Female)', course.female],
            ['Participants (Male)', course.male],
            ['Total Participants', course.total],
          ]}
        />

        <DetailSection
          icon={Award}
          title="Certification"
          fields={[
            ['Course Coordinator', course.coordinator],
            ['Certification Awarded', course.certification],
            ['Accreditation Body', course.accreditation],
            ['Total Certified', course.certified],
          ]}
        />
      </div>
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

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(numberFrom(value))
}

export default ShortCourseProfileDetail
