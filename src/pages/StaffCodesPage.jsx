import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataMatrixCode from '../components/DataMatrixCode'
import { useAuth } from '../hooks/useAuth'
import { listStaff } from '../services/registryService'
import { mockStaff, shouldUseMock } from '../services/reviewMock'
import { getReviewUrl } from '../utils/reviewOptions'
import { theme } from '../theme'

function StaffCodesPage() {
  const { auth } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [staff, setStaff] = useState([])

  const loadStaff = useCallback(async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      setStaff(await listStaff(auth.accessToken))
    } catch (error) {
      if (shouldUseMock(error)) {
        setStaff(mockStaff)
      } else {
        setErrorMessage(error.message)
        setStaff([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [auth.accessToken])

  useEffect(() => {
    const timeoutId = window.setTimeout(loadStaff, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadStaff])

  const downloadCode = (event, member) => {
    const canvas = event.currentTarget
      .closest('[data-code-card]')
      .querySelector('canvas')
    const link = document.createElement('a')

    link.download = `review-code-${member.full_name ?? staffId(member)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
            Review Codes
          </h2>
          <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            Data Matrix per staff member
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            to="/dashboard/admin"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Link>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
            onClick={loadStaff}
            type="button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 ${theme.classes.primaryButton}`}
            onClick={() => window.print()}
            type="button"
          >
            <Printer size={17} />
            Print all
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}>
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <p className={`text-sm ${theme.classes.muted}`}>Loading staff…</p>
      ) : staff.length === 0 && !errorMessage ? (
        <p className={`text-sm ${theme.classes.muted}`}>No staff records found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-3">
          {staff.map((member) => (
            <article
              className="flex break-inside-avoid flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
              data-code-card
              key={staffId(member)}
            >
              <DataMatrixCode scale={5} text={getReviewUrl(staffId(member))} />
              <div>
                <p className={`font-semibold ${theme.classes.heading}`}>
                  {member.full_name}
                </p>
                {member.department_name && (
                  <p className={`text-xs ${theme.classes.muted}`}>
                    {member.department_name}
                  </p>
                )}
                <p className={`mt-2 text-xs ${theme.classes.subtle}`}>
                  Scan to leave a review
                </p>
              </div>
              <button
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition print:hidden ${theme.classes.tableToolbarButton}`}
                onClick={(event) => downloadCode(event, member)}
                type="button"
              >
                <Download size={14} />
                Download PNG
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function staffId(member) {
  return member.staff_id ?? member.id
}

export default StaffCodesPage
