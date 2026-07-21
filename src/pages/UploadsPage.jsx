import { ArrowLeft, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { uploadFile } from '../services/registryService'
import { theme } from '../theme'

function UploadsPage() {
  const { auth } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setErrorMessage('Choose a file before uploading.')
      return
    }

    setErrorMessage('')
    setIsUploading(true)
    setUploadResult(null)

    try {
      setUploadResult(await uploadFile(auth.accessToken, selectedFile))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-bold ${theme.classes.heading}`}>
            Uploads
          </h2>
          <p className={`mt-1 text-xs font-semibold uppercase ${theme.classes.subtle}`}>
            API file upload
          </p>
        </div>
        <Link
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${theme.classes.tableToolbarButton}`}
          to="/dashboard/admin"
        >
          <ArrowLeft size={16} />
          Back to Admin
        </Link>
      </div>

      <section
        className={`border-t-4 p-5 sm:p-6 ${theme.classes.tableAccent} ${theme.classes.dashboardSurface}`}
      >
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className={`text-sm font-semibold ${theme.classes.label}`}>
              Select file
            </span>
            <input
              className={`rounded-xl border px-3 py-2.5 text-sm ${theme.classes.field}`}
              disabled={isUploading}
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>

          {errorMessage && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.errorBox}`}
            >
              {errorMessage}
            </div>
          )}

          {uploadResult && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${theme.classes.statusActive}`}
            >
              Upload completed.
            </div>
          )}

          <button
            className={`inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${theme.classes.primaryButton}`}
            disabled={isUploading}
            type="submit"
          >
            <UploadCloud size={17} />
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </section>
    </section>
  )
}

export default UploadsPage
