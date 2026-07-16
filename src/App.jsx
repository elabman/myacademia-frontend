import { useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import DashboardHomePage from './pages/DashboardHomePage'
import LoginPage from './pages/LoginPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectFormPage from './pages/ProjectFormPage'
import ProjectsPage from './pages/ProjectsPage'
import ShortCourseDetailPage from './pages/ShortCourseDetailPage'
import ShortCourseFormPage from './pages/ShortCourseFormPage'
import ShortCoursesPage from './pages/ShortCoursesPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginRoute onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardPage onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate replace to="/login" />
            )
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="projects/new" element={<ProjectFormPage />} />
          <Route path="short-courses" element={<ShortCoursesPage />} />
          <Route
            path="short-courses/:courseId"
            element={<ShortCourseDetailPage />}
          />
          <Route path="short-courses/new" element={<ShortCourseFormPage />} />
        </Route>
        <Route
          path="*"
          element={<Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

function LoginRoute({ onLogin }) {
  const navigate = useNavigate()

  return (
    <LoginPage
      onLogin={() => {
        onLogin()
        navigate('/dashboard')
      }}
    />
  )
}

export default App
