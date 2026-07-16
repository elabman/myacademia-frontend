import StatCard from '../components/StatCard'
import { dashboardStats } from '../data/registryData'
import { theme } from '../theme'

function DashboardHomePage() {
  return (
    <>
      <section
        className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
      >
        <h1 className={`text-xl font-bold ${theme.classes.heading}`}>
          Welcome back, User!
        </h1>
        <p className={`mt-2 text-sm ${theme.classes.muted}`}>
          Here&apos;s an overview of projects and short courses at MyAcademia.
        </p>
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section
        className={`mt-4 min-h-[180px] rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
      >
        <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
          Recent Activity
        </h2>
        <p className={`mt-6 text-sm ${theme.classes.muted}`}>
          You have no recent activity.
        </p>
      </section>
    </>
  )
}

export default DashboardHomePage
