import { useCallback, useEffect, useState } from 'react'
import {
  BookOpenCheck,
  ChevronRight,
  Database,
  FilePlus2,
  FileText,
  FolderKanban,
  LibraryBig,
  UploadCloud,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { useAuth } from '../hooks/useAuth'
import { theme } from '../theme'
import {
  getProjectsSummary,
  getShortCoursesSummary,
  listProjects,
  listShortCourses,
} from '../services/registryService'

const quickActions = [
  {
    icon: FilePlus2,
    label: 'Add Project',
    supporting: 'Register partner project work',
    to: '/dashboard/projects/new',
  },
  {
    icon: BookOpenCheck,
    label: 'Add Short Course',
    supporting: 'Create a new training record',
    to: '/dashboard/short-courses/new',
  },
  {
    icon: FolderKanban,
    label: 'Projects',
    supporting: 'Review project registry',
    to: '/dashboard/projects',
  },
  {
    icon: LibraryBig,
    label: 'Short Courses',
    supporting: 'Open course offerings',
    to: '/dashboard/short-courses',
  },
  {
    icon: Database,
    label: 'Departments',
    supporting: 'Manage academic departments',
    to: '/dashboard/departments',
  },
  {
    icon: UploadCloud,
    label: 'Uploads',
    supporting: 'Attach supporting files',
    to: '/dashboard/admin/uploads',
  },
]

function DashboardHomePage() {
  const { auth } = useAuth()
  const displayName = auth?.user?.full_name || auth?.user?.name || 'User'
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [records, setRecords] = useState({ courses: [], projects: [] })
  const [stats, setStats] = useState([])
  const [summary, setSummary] = useState({
    activeProjects: 0,
    certifiedTrainees: 0,
    completedCourses: 0,
    pipelineProjects: 0,
    planningCourses: 0,
    projectsTotal: 0,
    shortCoursesTotal: 0,
  })

  const loadDashboard = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const [projectsSummary, shortCoursesSummary, projectsList, coursesList] =
        await Promise.all([
          getProjectsSummary(auth.accessToken).catch(() => null),
          getShortCoursesSummary(auth.accessToken).catch(() => null),
          listProjects(auth.accessToken, { limit: 100, page: 1 }).catch(() => ({
            rows: [],
          })),
          listShortCourses(auth.accessToken, { limit: 100, page: 1 }).catch(
            () => ({ rows: [] }),
          ),
        ])

      const projects = projectsList.rows
      const courses = coursesList.rows
      const activeProjects = statusCount(projectsSummary, projects, 'active')
      const completedCourses = statusCount(shortCoursesSummary, courses, 'completed')
      const pipelineProjects = statusCount(projectsSummary, projects, 'pipeline')
      const planningCourses = statusCount(shortCoursesSummary, courses, 'planning')
      const certifiedTrainees =
        shortCoursesSummary?.total_certified ??
        shortCoursesSummary?.certified ??
        courses.reduce((total, course) => total + numberFrom(course.certified), 0)

      setRecords({ courses, projects })
      setSummary({
        activeProjects,
        certifiedTrainees,
        completedCourses,
        pipelineProjects,
        planningCourses,
        projectsTotal: countFrom(projectsSummary, projects.length),
        shortCoursesTotal: countFrom(shortCoursesSummary, courses.length),
      })

      setStats([
        {
          label: 'Projects',
          value: countFrom(projectsSummary, projects.length),
          action: 'View projects',
          to: '/dashboard/projects',
          icon: FolderKanban,
          iconClass: theme.classes.dashboardIconUsers,
        },
        {
          label: 'Short Courses',
          value: countFrom(shortCoursesSummary, courses.length),
          action: 'View short courses',
          to: '/dashboard/short-courses',
          icon: BookOpenCheck,
          iconClass: theme.classes.dashboardIconMessages,
        },
        {
          label: 'Active Projects',
          value: activeProjects,
          action: 'Review active work',
          to: '/dashboard/projects',
          icon: FileText,
          iconClass: theme.classes.dashboardIconReports,
        },
        {
          label: 'Certified Trainees',
          value: certifiedTrainees,
          action: 'Open registry',
          to: '/dashboard/short-courses',
          icon: UsersRound,
          iconClass: theme.classes.dashboardIconSettings,
        },
      ])
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDashboard, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadDashboard])

  return (
    <section className="space-y-4">
      <section
        className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
      >
        <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr] xl:items-center">
          <div>
            <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
              MyAcademia Control Center
            </p>
            <h1 className={`mt-2 text-xl font-bold ${theme.classes.heading}`}>
              Welcome back, {displayName}!
            </h1>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${theme.classes.muted}`}>
              Monitor RP Kigali College projects, short courses, registry status,
              and recent records from one focused administrator workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <WelcomeMetric label="Project records" value={summary.projectsTotal} />
            <WelcomeMetric label="Course records" value={summary.shortCoursesTotal} />
            <WelcomeMetric label="Certified" value={summary.certifiedTrainees} />
          </div>
        </div>
      </section>

      {errorMessage && (
        <section
          className={`rounded-2xl border p-4 text-sm ${theme.classes.errorBox}`}
        >
          {errorMessage}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.label} isLoading={isLoading} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section
          className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
        >
          <SectionHeader
            eyebrow="Operational health"
            subtitle="A compact read of projects and short courses by current status."
            title="Status Overview"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatusMetric
              className={theme.classes.statusActive}
              label="Active Projects"
              total={summary.projectsTotal}
              value={summary.activeProjects}
            />
            <StatusMetric
              className={theme.classes.statusPipeline}
              label="Pipeline Projects"
              total={summary.projectsTotal}
              value={summary.pipelineProjects}
            />
            <StatusMetric
              className={theme.classes.statusCompleted}
              label="Completed Courses"
              total={summary.shortCoursesTotal}
              value={summary.completedCourses}
            />
            <StatusMetric
              className={theme.classes.statusPlanning}
              label="Planning Courses"
              total={summary.shortCoursesTotal}
              value={summary.planningCourses}
            />
          </div>
        </section>

        <section
          className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
        >
          <SectionHeader
            eyebrow="Fast access"
            subtitle="Jump straight into the registry workflows used most often."
            title="Quick Actions"
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <ActionRow key={action.to} {...action} />
            ))}
          </div>
        </section>
      </section>

      <section
        className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Latest records"
            subtitle="Recent project and short course rows returned by the API."
            title="Recent Registry Activity"
          />

          <Link
            className={`inline-flex items-center gap-1 text-sm font-semibold ${theme.classes.link}`}
            to="/dashboard/projects"
          >
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <RecentList
            emptyMessage="No projects returned yet."
            items={records.projects.slice(0, 4)}
            title="Projects"
            type="project"
          />
          <RecentList
            emptyMessage="No short courses returned yet."
            items={records.courses.slice(0, 4)}
            title="Short Courses"
            type="course"
          />
        </div>
      </section>
    </section>
  )
}

function WelcomeMetric({ label, value }) {
  return (
    <div className={`rounded-xl border p-4 ${theme.classes.dashboardInfoPanel}`}>
      <p className={`text-xs ${theme.classes.muted}`}>{label}</p>
      <p className={`mt-1 text-xl font-bold ${theme.classes.heading}`}>
        {formatNumber(value)}
      </p>
    </div>
  )
}

function SectionHeader({ eyebrow, subtitle, title }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-1 text-lg font-bold ${theme.classes.heading}`}>{title}</h2>
      <p className={`mt-1 text-sm leading-6 ${theme.classes.muted}`}>{subtitle}</p>
    </div>
  )
}

function StatusMetric({ className, label, total, value }) {
  const percentage = total > 0 ? Math.min((Number(value) / total) * 100, 100) : 0

  return (
    <article className={`rounded-xl border p-4 ${theme.classes.dashboardInset}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${theme.classes.heading}`}>{label}</p>
          <p className={`mt-1 text-xs ${theme.classes.muted}`}>
            {formatNumber(value)} of {formatNumber(total)} records
          </p>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${className}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className={`mt-4 h-2 overflow-hidden rounded-full ${theme.classes.progressTrack}`}>
        <div
          className={`h-full rounded-full ${theme.classes.progressFill}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </article>
  )
}

function ActionRow({ icon: Icon, label, supporting, to }) {
  return (
    <Link
      className={`group flex items-center justify-between gap-3 rounded-xl border p-3 transition ${theme.classes.dashboardActionCard}`}
      to={to}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${theme.classes.dashboardIconMessages}`}
        >
          <Icon size={18} />
        </span>
        <span className="min-w-0">
          <span className={`block truncate text-sm font-semibold ${theme.classes.heading}`}>
            {label}
          </span>
          <span className={`block truncate text-xs ${theme.classes.muted}`}>
            {supporting}
          </span>
        </span>
      </span>
      <ChevronRight
        className={`shrink-0 transition group-hover:translate-x-0.5 ${theme.classes.icon}`}
        size={18}
      />
    </Link>
  )
}

function RecentList({ emptyMessage, items, title, type }) {
  return (
    <div className={`overflow-hidden rounded-xl border ${theme.classes.dashboardInset}`}>
      <div className={`border-b px-4 py-3 ${theme.classes.tableDivider}`}>
        <h3 className={`text-sm font-bold ${theme.classes.heading}`}>{title}</h3>
      </div>
      <div className="divide-y">
        {items.length === 0 && (
          <p className={`px-4 py-4 text-sm ${theme.classes.muted}`}>
            {emptyMessage}
          </p>
        )}

        {items.map((item) => (
          <RecentRow item={item} key={`${type}-${item.id ?? item.sn}`} type={type} />
        ))}
      </div>
    </div>
  )
}

function RecentRow({ item, type }) {
  const isProject = type === 'project'
  const details = isProject
    ? [
        item.donor !== '-' ? item.donor : 'Donor not listed',
        item.endDate !== '-' ? `Ends ${item.endDate}` : 'No end date',
      ]
    : [
        item.department !== '-' ? item.department : 'Department not listed',
        `${formatNumber(numberFrom(item.total))} participants`,
      ]

  return (
    <Link
      className={`flex items-center justify-between gap-4 px-4 py-3 transition ${theme.classes.tableRowHover}`}
      to={
        isProject
          ? `/dashboard/projects/${item.id ?? item.sn}`
          : `/dashboard/short-courses/${item.id ?? item.sn}`
      }
    >
      <span className="min-w-0">
        <span className={`block truncate text-sm font-semibold ${theme.classes.heading}`}>
          {item.title || 'Untitled record'}
        </span>
        <span className={`mt-1 block truncate text-xs ${theme.classes.muted}`}>
          {details.join(' | ')}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <StatusBadge status={item.status} />
        <ChevronRight size={16} className={theme.classes.icon} />
      </span>
    </Link>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}
    >
      {status || '-'}
    </span>
  )
}

function countFrom(summary, fallbackValue) {
  return summary?.total ?? summary?.count ?? summary?.total_count ?? fallbackValue
}

function statusCount(summary, rows, status) {
  const summaryValue =
    summary?.[status] ?? summary?.[`${status}_count`] ?? summary?.statuses?.[status]

  if (summaryValue !== undefined) {
    return summaryValue
  }

  return rows.filter((row) => String(row.status).toLowerCase().includes(status)).length
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

export default DashboardHomePage
