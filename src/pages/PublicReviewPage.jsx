import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getReviewTarget, submitReview } from '../services/reviewService'
import { reviewRatings } from '../utils/reviewOptions'

function PublicReviewPage() {
  const { staffId } = useParams()
  const [comment, setComment] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(null)
  const [reviewerName, setReviewerName] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [target, setTarget] = useState(null)

  useEffect(() => {
    let isActive = true

    getReviewTarget(staffId)
      .then((data) => isActive && setTarget(data))
      .catch((error) => isActive && setErrorMessage(error.message))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [staffId])

  const staff = target?.staff ?? target
  const services = target?.services ?? []
  const canSubmit = Boolean(serviceId && rating) && !isSubmitting

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await submitReview({
        comment: comment.trim() || null,
        rating,
        reviewer_name: reviewerName.trim() || null,
        service_id: Number(serviceId),
        staff_id: Number(staffId),
      })
      setIsSubmitted(true)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#eef0fb] px-4 py-6">
      <div className="mx-auto w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-xl">
        {isLoading ? (
          <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={18} />
            Loading…
          </p>
        ) : isSubmitted ? (
          <div className="space-y-3 py-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
            <h1 className="text-xl font-bold text-slate-900">Thank you!</h1>
            <p className="text-sm text-slate-500">
              Your review has been sent.
            </p>
          </div>
        ) : !staff ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage || 'This review link is not valid.'}
          </p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {target.demo && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
                Demo mode: backend not connected, reviews are saved locally.
              </p>
            )}
            <header className="text-center">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Rate your experience with
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">
                {staff.full_name}
              </h1>
              {staff.department_name && (
                <p className="text-sm text-slate-500">{staff.department_name}</p>
              )}
            </header>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-800">
                Service received
              </span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                onChange={(event) => setServiceId(event.target.value)}
                required
                value={serviceId}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option
                    key={service.service_id ?? service.id}
                    value={service.service_id ?? service.id}
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-800">
                How was it?
              </legend>
              <div className="grid grid-cols-5 gap-2">
                {reviewRatings.map((option) => (
                  <button
                    aria-pressed={rating === option.value}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-3 transition ${
                      rating === option.value
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    key={option.value}
                    onClick={() => setRating(option.value)}
                    type="button"
                  >
                    <span className="text-3xl leading-none">{option.emoji}</span>
                    <span className="text-[10px] font-medium text-slate-600">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-800">
                Comment (optional)
              </span>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                maxLength={1000}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us more…"
                rows={4}
                value={comment}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-800">
                Your name (optional)
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                maxLength={100}
                onChange={(event) => setReviewerName(event.target.value)}
                value={reviewerName}
              />
            </label>

            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-gradient-to-r from-[#6d5df5] to-[#5647e0] px-4 py-3 text-base font-semibold text-white shadow-lg transition disabled:opacity-50"
              disabled={!canSubmit}
              type="submit"
            >
              {isSubmitting ? 'Sending…' : 'Send review'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default PublicReviewPage
