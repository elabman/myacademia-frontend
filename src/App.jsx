import { useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import AcademicYearsPage from './pages/AcademicYearsPage'
import ApprovalsPage from './pages/ApprovalsPage'
import AuditLogPage from './pages/AuditLogPage'
import DashboardPage from './pages/DashboardPage'
import DashboardHomePage from './pages/DashboardHomePage'
import DepartmentsPage from './pages/DepartmentsPage'
import PatternerPage from './pages/PatternerPage'
import LoginPage from './pages/LoginPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectEditPage from './pages/ProjectEditPage'
import ProjectFormPage from './pages/ProjectFormPage'
import ProjectsPage from './pages/ProjectsPage'
import ShortCourseDetailPage from './pages/ShortCourseDetailPage'
import ShortCourseEditPage from './pages/ShortCourseEditPage'
import ShortCourseFormPage from './pages/ShortCourseFormPage'
import ShortCoursesPage from './pages/ShortCoursesPage'
import SectorsPage from './pages/SectorsPage'
import StaffPage from './pages/StaffPage'
import UploadsPage from './pages/UploadsPage'
import UsersPage from './pages/UsersPage'
import { AuthProvider } from './contexts/AuthContext'
import { getCurrentUser, loginUser, logoutUser } from './services/authService'

const AUTH_STORAGE_KEY = 'myacademia.auth'

function App() {
  const [auth, setAuth] = useState(() => readStoredAuth())
  const isAuthenticated = Boolean(auth?.accessToken)

  const handleLogin = async (credentials) => {
    const authData = await loginUser(credentials)
    const accessToken = authData?.accessToken

    if (!accessToken) {
      throw new Error('Login succeeded, but no access token was returned.')
    }

    let user = authData?.user ?? null

    try {
      user = user ?? (await getCurrentUser(accessToken))
    } catch {
      user = null
    }

    const nextAuth = {
      accessToken,
      refreshToken: authData?.refreshToken ?? null,
      user,
    }

    setAuth(nextAuth)
    storeAuth(nextAuth, credentials.rememberMe)
  }

  const handleLogout = async () => {
    const accessToken = auth?.accessToken
    setAuth(null)
    clearStoredAuth()

    try {
      await logoutUser(accessToken)
    } catch {
      // The UI should still log out even if the backend session is already gone.
    }
  }

  return (
    <AuthProvider value={{ auth, onLogout: handleLogout }}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate replace to="/dashboard" />
              ) : (
                <LoginRoute onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <DashboardPage onLogout={handleLogout} user={auth?.user} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          >
            <Route index element={<DashboardHomePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<ProjectFormPage />} />
            <Route path="projects/:projectId/edit" element={<ProjectEditPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="short-courses" element={<ShortCoursesPage />} />
            <Route
              path="short-courses/new"
              element={<ShortCourseFormPage />}
            />
            <Route
              path="short-courses/:courseId/edit"
              element={<ShortCourseEditPage />}
            />
            <Route
              path="short-courses/:courseId"
              element={<ShortCourseDetailPage />}
            />
            <Route path="partners" element={<PatternerPage />} />
            <Route
              path="donors"
              element={<Navigate replace to="/dashboard/partners" />}
            />
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/users" element={<UsersPage />} />
            <Route path="admin/departments" element={<DepartmentsPage />} />
            <Route path="admin/sectors" element={<SectorsPage />} />
            <Route path="admin/academic-years" element={<AcademicYearsPage />} />
            <Route path="admin/staff" element={<StaffPage />} />
            <Route path="admin/approvals" element={<ApprovalsPage />} />
            <Route path="admin/audit-log" element={<AuditLogPage />} />
            <Route path="admin/uploads" element={<UploadsPage />} />
            <Route
              path="departments"
              element={<Navigate replace to="/dashboard/admin/departments" />}
            />
            <Route
              path="sectors"
              element={<Navigate replace to="/dashboard/admin/sectors" />}
            />
            <Route
              path="academic-years"
              element={<Navigate replace to="/dashboard/admin/academic-years" />}
            />
            <Route path="users" element={<Navigate replace to="/dashboard/admin/users" />} />
            <Route path="staff" element={<Navigate replace to="/dashboard/admin/staff" />} />
            <Route
              path="approvals"
              element={<Navigate replace to="/dashboard/admin/approvals" />}
            />
            <Route
              path="audit-log"
              element={<Navigate replace to="/dashboard/admin/audit-log" />}
            />
            <Route path="uploads" element={<Navigate replace to="/dashboard/admin/uploads" />} />
          </Route>
          <Route
            path="*"
            element={
              <Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function readStoredAuth() {
  return readStorage(window.sessionStorage) ?? readStorage(window.localStorage)
}

function readStorage(storage) {
  try {
    const storedAuth = storage.getItem(AUTH_STORAGE_KEY)
    return storedAuth ? JSON.parse(storedAuth) : null
  } catch {
    return null
  }
}

function storeAuth(auth, shouldRemember) {
  try {
    const storage = shouldRemember ? window.localStorage : window.sessionStorage
    const unusedStorage = shouldRemember ? window.sessionStorage : window.localStorage

    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    unusedStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Auth still works in memory if browser storage is unavailable.
  }
}

function clearStoredAuth() {
  try {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // Nothing to clear if browser storage is unavailable.
  }
}

function LoginRoute({ onLogin }) {
  const navigate = useNavigate()

  return (
    <LoginPage
      onLogin={async (credentials) => {
        await onLogin(credentials)
        navigate('/dashboard')
      }}
    />
  )
}

export default App
