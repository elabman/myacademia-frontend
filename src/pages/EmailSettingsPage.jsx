import { ArrowLeft } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import ReviewNotificationSettings from '../components/ReviewNotificationSettings'
import { useAuth } from '../hooks/useAuth'
import { theme } from '../theme'

export default function EmailSettingsPage() {
  const { auth } = useAuth()

  if (Number(auth?.user?.role_id) !== 6) {
    return <Navigate replace to="/dashboard/admin" />
  }

  return (
    <div className="space-y-4">
      <Link
        className={`inline-flex items-center gap-2 text-sm font-medium hover:underline ${theme.classes.heading}`}
        to="/dashboard/admin"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back to Admin
      </Link>
      <ReviewNotificationSettings accessToken={auth.accessToken} />
    </div>
  )
}
