import { Link } from 'react-router-dom'
import { theme } from '../theme'

function StatCard({
  action,
  detail,
  icon: Icon,
  iconClass,
  isLoading = false,
  label,
  to,
  value,
}) {
  return (
    <article
      className={`rounded-2xl border p-4 transition hover:-translate-y-1 hover:shadow-lg sm:p-5 ${theme.classes.dashboardSurface}`}
    >
      <div className="flex h-full items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${theme.classes.muted}`}>
            {label}
          </p>
          <p className={`mt-2 text-xl font-bold ${theme.classes.heading}`}>
            {isLoading ? '...' : value}
          </p>
          {detail && (
            <p className={`mt-1 text-xs ${theme.classes.subtle}`}>{detail}</p>
          )}
          <Link
            className={`mt-5 inline-flex text-sm font-medium ${theme.classes.link}`}
            to={to}
          >
            {action}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default StatCard
