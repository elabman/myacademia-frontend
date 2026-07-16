import {
  Bell,
  BookOpenCheck,
  ChevronDown,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import { theme } from '../theme'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: Home, end: true },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  {
    to: '/dashboard/short-courses',
    label: 'Short Courses',
    icon: BookOpenCheck,
  },
]

function DashboardPage({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = getPageTitle(pathname)

  return (
    <main className={`min-h-dvh ${theme.classes.dashboardShell}`}>
      <div className="flex min-h-dvh">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={onLogout}
        />

        {isSidebarOpen && (
          <button
            type="button"
            className={`fixed inset-0 z-30 md:hidden ${theme.classes.dashboardOverlay}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <section className="min-w-0 flex-1">
          <Topbar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            title={pageTitle}
          />

          <div className="w-full px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  )
}

function getPageTitle(pathname) {
  if (pathname === '/dashboard/projects/new') {
    return 'New Project'
  }

  if (pathname.startsWith('/dashboard/projects/')) {
    return 'Project Details'
  }

  if (pathname === '/dashboard/projects') {
    return 'Projects'
  }

  if (pathname === '/dashboard/short-courses/new') {
    return 'New Short Course'
  }

  if (pathname.startsWith('/dashboard/short-courses/')) {
    return 'Short Course Details'
  }

  if (pathname === '/dashboard/short-courses') {
    return 'Short Courses'
  }

  return 'Dashboard'
}

function Sidebar({ isOpen, onClose, onLogout }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-60 -translate-x-full flex-col p-4 transition-transform duration-300 md:sticky md:top-0 md:z-auto md:min-h-dvh md:translate-x-0 lg:w-64 ${
        isOpen ? 'translate-x-0' : ''
      } ${theme.classes.dashboardSidebar}`}
    >
      <div className="flex items-center justify-between">
        <div className={theme.classes.dashboardSidebarLogo}>
          <Logo compact inverse />
        </div>
        <button
          type="button"
          className={`rounded-xl p-2 transition md:hidden ${theme.classes.dashboardSidebarClose}`}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="mt-8 grid gap-2">
        {navigation.map(({ end, icon: Icon, label, to }) => (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? theme.classes.dashboardNavActive
                  : theme.classes.dashboardNavItem
              }`
            }
            end={end}
            key={to}
            onClick={onClose}
            to={to}
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className={`mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${theme.classes.dashboardLogout}`}
      >
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  )
}

function Topbar({ onOpenSidebar, title }) {
  return (
    <header
      className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 sm:px-5 lg:px-6 ${theme.classes.dashboardTopbar}`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          className={`rounded-xl p-2 transition md:hidden ${theme.classes.icon} ${theme.classes.iconHover}`}
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className={`text-lg font-bold sm:text-xl ${theme.classes.heading}`}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`hidden rounded-xl p-2 transition sm:block ${theme.classes.icon} ${theme.classes.iconHover}`}
          aria-label="Notifications"
        >
          <Bell size={21} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full ${theme.classes.dashboardAvatar}`}
          >
            <UserRound size={25} />
          </div>
          <button
            type="button"
            className={`hidden items-center gap-2 text-sm font-medium sm:flex ${theme.classes.heading}`}
          >
            Hello, User
            <ChevronDown size={18} className={theme.classes.icon} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardPage
