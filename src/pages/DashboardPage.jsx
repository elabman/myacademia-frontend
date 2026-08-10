import {
  Bell,
  BookOpenCheck,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  Settings,
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
  { to: '/dashboard/mou-agreements', label: 'MoUs', icon: FileText },
  { to: '/dashboard/partners', label: 'Partners', icon: FolderKanban },
  { to: '/dashboard/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/dashboard/admin', label: 'Admin', icon: Settings },
]

function DashboardPage({ onLogout, user }) {
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
            onLogout={onLogout}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            title={pageTitle}
            user={user}
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

  if (pathname.match(/^\/dashboard\/projects\/[^/]+\/edit$/)) {
    return 'Edit Project'
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

  if (pathname.match(/^\/dashboard\/short-courses\/[^/]+\/edit$/)) {
    return 'Edit Short Course'
  }

  if (pathname.startsWith('/dashboard/short-courses/')) {
    return 'Short Course Details'
  }

  if (pathname === '/dashboard/short-courses') {
    return 'Short Courses'
  }

  if (pathname === '/dashboard/mou-agreements/new') {
    return 'New MoU'
  }

  if (pathname.match(/^\/dashboard\/mou-agreements\/[^/]+\/edit$/)) {
    return 'Edit MoU'
  }

  if (pathname.startsWith('/dashboard/mou-agreements/')) {
    return 'MoU Details'
  }

  if (pathname === '/dashboard/mou-agreements') {
    return 'MoU Agreements'
  }

  if (pathname === '/dashboard/partners' || pathname === '/dashboard/donors') {
    return 'Partners'
  }

  if (pathname === '/dashboard/admin') {
    return 'Admin'
  }

  if (pathname === '/dashboard/admin/users') {
    return 'Users'
  }

  if (pathname === '/dashboard/admin/departments') {
    return 'Departments'
  }

  if (pathname === '/dashboard/admin/sectors') {
    return 'Sectors'
  }

  if (pathname === '/dashboard/admin/academic-years') {
    return 'Academic Years'
  }

  if (pathname === '/dashboard/admin/staff') {
    return 'Staff'
  }

  if (pathname === '/dashboard/admin/approvals') {
    return 'Approvals'
  }

  if (pathname === '/dashboard/admin/audit-log') {
    return 'Audit Log'
  }

  if (pathname === '/dashboard/admin/uploads') {
    return 'Uploads'
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

      <nav className="mt-8 grid gap-1.5 overflow-y-auto pr-1">
        {navigation.map(({ end, icon: Icon, label, to }) => (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
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

function Topbar({ onLogout, onOpenSidebar, title, user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const displayName = user?.full_name || user?.name || 'User'

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
        <div className="relative">
          <button
            type="button"
            className={`flex items-center gap-2 text-sm font-medium ${theme.classes.heading}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.classes.dashboardAvatar}`}
            >
              <UserRound size={20} />
            </div>
            <span className="hidden sm:inline">Hello, {displayName}</span>
            <ChevronDown size={16} className={theme.classes.icon} />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div
                className={`absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-lg ${theme.classes.dashboardSurface}`}
              >
                <div className={`border-b px-4 py-3 ${theme.classes.tableDivider}`}>
                  <p className={`text-sm font-semibold ${theme.classes.heading}`}>
                    {displayName}
                  </p>
                  <p className={`text-xs ${theme.classes.muted}`}>
                    {user?.email || ''}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${theme.classes.tableRowHover} ${theme.classes.dangerText}`}
                    onClick={() => {
                      setIsDropdownOpen(false)
                      onLogout()
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default DashboardPage
