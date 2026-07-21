import {
  Building2,
  Calendar,
  History,
  Layers,
  UploadCloud,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { theme } from '../theme'

const adminItems = [
  {
    description: 'Manage application accounts and access.',
    icon: UsersRound,
    label: 'Users',
    to: '/dashboard/admin/users',
  },
  {
    description: 'Review staff records returned by the API.',
    icon: UserRound,
    label: 'Staff',
    to: '/dashboard/admin/staff',
  },
  {
    description: 'Organise academic departments and codes.',
    icon: Building2,
    label: 'Departments',
    to: '/dashboard/admin/departments',
  },
  {
    description: 'Manage project themes and focus areas.',
    icon: Layers,
    label: 'Sectors',
    to: '/dashboard/admin/sectors',
  },
  {
    description: 'Track academic calendar years and status.',
    icon: Calendar,
    label: 'Academic Years',
    to: '/dashboard/admin/academic-years',
  },
  {
    description: 'View recorded system activity.',
    icon: History,
    label: 'Audit Log',
    to: '/dashboard/admin/audit-log',
  },
  {
    description: 'Upload and review supporting files.',
    icon: UploadCloud,
    label: 'Uploads',
    to: '/dashboard/admin/uploads',
  },
]

function AdminPage() {
  return (
    <section className="space-y-4">
      <section
        className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}
      >
        <p className={`text-xs font-semibold uppercase ${theme.classes.subtle}`}>
          System Administration
        </p>
        <h2 className={`mt-1 text-lg font-bold ${theme.classes.heading}`}>
          Admin
        </h2>
        <p className={`mt-2 max-w-3xl text-sm leading-6 ${theme.classes.muted}`}>
          Manage users, staff, departments, sectors, academic years, uploads
          and audit records from one place.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminItems.map(({ description, icon: Icon, label, to }) => (
          <Link
            className={`rounded-2xl border p-5 transition ${theme.classes.dashboardActionCard}`}
            key={to}
            to={to}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.classes.dashboardIconUsers}`}
            >
              <Icon size={19} />
            </div>
            <h3 className={`mt-4 text-base font-bold ${theme.classes.heading}`}>
              {label}
            </h3>
            <p className={`mt-2 text-sm leading-6 ${theme.classes.muted}`}>
              {description}
            </p>
          </Link>
        ))}
      </section>
    </section>
  )
}

export default AdminPage
