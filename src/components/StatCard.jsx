import { Link } from 'react-router-dom'
import { theme } from '../theme'

function StatCard({ action, icon: Icon, iconClass, label, to, value }) {
  return (
    <article
      className={`rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-lg ${theme.classes.dashboardSurface}`}
    >
      <div className="flex h-full items-start gap-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={28} />
        </div>
        <div>
          <p className={`text-sm ${theme.classes.muted}`}>{label}</p>
          <p className={`mt-3 text-xl font-bold ${theme.classes.heading}`}>
            {value}
          </p>
          <Link className={`mt-6 inline-flex text-sm font-medium ${theme.classes.link}`} to={to}>
            {action}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default StatCard
