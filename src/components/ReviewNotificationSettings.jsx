import { useEffect, useState } from 'react'
import { getReviewNotificationSettings, saveReviewNotificationSettings } from '../services/reviewService'
import { theme } from '../theme'

export default function ReviewNotificationSettings({ accessToken }) {
  const [settings, setSettings] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    getReviewNotificationSettings(accessToken)
      .then((data) => {
        if (active) setSettings(data)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => { active = false }
  }, [accessToken])

  function updateSettings(changes) {
    setSettings((current) => ({ ...current, ...changes }))
    setMessage('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!settings || isSaving) return

    setIsSaving(true)
    setMessage('')
    setError('')

    try {
      const saved = await saveReviewNotificationSettings(accessToken, {
        ...settings,
        recipient_email: settings.recipient_email.trim(),
      })
      setSettings(saved)
      setMessage('Review notification settings saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={`rounded-2xl border p-5 sm:p-6 ${theme.classes.dashboardSurface}`}>
      <h2 className={`text-lg font-bold ${theme.classes.heading}`}>Review email notifications</h2>
      <p className={`mt-1 text-sm ${theme.classes.muted}`}>
        Choose where to send an email when someone submits a review.
      </p>

      {settings ? (
        <form className="mt-4 max-w-md" onSubmit={handleSubmit}>
          <fieldset className="space-y-4" disabled={isSaving}>
            <label className="block space-y-1.5">
              <span className={`text-sm font-medium ${theme.classes.heading}`}>Recipient email</span>
              <input
                autoComplete="email"
                className={`w-full border px-3 py-2.5 focus:outline-none focus:ring-2 ${theme.classes.formControl}`}
                type="email"
                maxLength={254}
                required={settings.enabled}
                value={settings.recipient_email}
                onChange={(event) => updateSettings({
                  recipient_email: event.target.value,
                  enabled: Boolean(event.target.value.trim()) && settings.enabled,
                })}
              />
            </label>
            <label className={`flex items-center gap-2 text-sm font-medium ${theme.classes.heading}`}>
              <input
                type="checkbox"
                checked={settings.enabled}
                disabled={!settings.recipient_email.trim()}
                onChange={(event) => updateSettings({ enabled: event.target.checked })}
              />
              Enable review email notifications
            </label>
            <button
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${theme.classes.primaryButton}`}
              type="submit"
            >
              {isSaving ? 'Saving…' : 'Save settings'}
            </button>
          </fieldset>
        </form>
      ) : !error && (
        <p role="status" className={`mt-4 text-sm ${theme.classes.muted}`}>Loading settings…</p>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className={`mt-3 text-sm ${theme.classes.muted}`}>{message}</p>}
    </section>
  )
}
