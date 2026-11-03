import bwipjs from 'bwip-js'
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DataMatrixCode from '../components/DataMatrixCode'
import ReviewCodePrintSheet from '../components/ReviewCodePrintSheet'
import { useAuth } from '../hooks/useAuth'
import { listStaff } from '../services/registryService'
import { mockStaff, shouldUseMock } from '../services/reviewMock'
import { getReviewUrl } from '../utils/reviewOptions'
import { theme } from '../theme'

function StaffCodesPage() {
  const { auth } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [printJob, setPrintJob] = useState(null)
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

  const cards = useMemo(
    () =>
      staff.map((member) => ({
        department: member.department_name,
        key: staffId(member),
        name: member.full_name,
        url: getReviewUrl(staffId(member)),
      })),
    [staff],
  )

  // Print once the sheet (and its canvases) are on the page, then clear it afterwards.
  useEffect(() => {
    if (!printJob) {
      return undefined
    }

    const clear = () => setPrintJob(null)
    const timeoutId = window.setTimeout(() => window.print(), 200)

    window.addEventListener('afterprint', clear)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('afterprint', clear)
    }
  }, [printJob])

  const downloadCode = (card) => {
    // Render at a high scale so the PNG stays sharp when printed or shared.
    const canvas = document.createElement('canvas')

    bwipjs.toCanvas(canvas, {
      bcid: 'datamatrix',
      paddingheight: 4,
      paddingwidth: 4,
      scale: 12,
      text: card.url,
    })

    const link = document.createElement('a')

    link.download = `review-code-${card.name}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:opacity-60 ${theme.classes.primaryButton}`}
            disabled={cards.length === 0}
            onClick={() => setPrintJob({ members: cards, single: false })}
            type="button"
          >
            <Printer size={17} />
            Print all (6 per A4 page)
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
      ) : cards.length === 0 && !errorMessage ? (
        <p className={`text-sm ${theme.classes.muted}`}>No staff records found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
              key={card.key}
            >
              <DataMatrixCode
                className="h-auto w-40 max-w-full [image-rendering:pixelated]"
                scale={6}
                text={card.url}
              />
              <div>
                <p className={`font-semibold ${theme.classes.heading}`}>{card.name}</p>
                {card.department && (
                  <p className={`text-xs ${theme.classes.muted}`}>{card.department}</p>
                )}
                <p className={`mt-2 text-xs ${theme.classes.subtle}`}>
                  Scan to leave a review
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${theme.classes.tableToolbarButton}`}
                  onClick={() => setPrintJob({ members: [card], single: true })}
                  type="button"
                >
                  <Printer size={14} />
                  Print
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${theme.classes.tableToolbarButton}`}
                  onClick={() => downloadCode(card)}
                  type="button"
                >
                  <Download size={14} />
                  PNG
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {printJob && (
        <ReviewCodePrintSheet members={printJob.members} single={printJob.single} />
      )}
    </section>
  )
}

function staffId(member) {
  return member.staff_id ?? member.id
}

export default StaffCodesPage
