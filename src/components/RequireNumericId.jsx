import { Link, useParams } from 'react-router-dom'
import { theme } from '../theme'

/**
 * Renders its page only when the record number in the address is a real positive integer.
 * An old bookmark, history entry or open tab can carry a bad address such as /short-courses/-;
 * without this guard the page would ask the API for "-" and show "Validation failed".
 */
function RequireNumericId({ backLabel, backTo, children, param }) {
  const params = useParams()
  const id = params[param] ?? ''

  if (/^[1-9]\d*$/.test(id)) {
    return children
  }

  return (
    <section className={`mx-auto max-w-xl rounded-2xl border p-6 text-center ${theme.classes.dashboardSurface}`}>
      <h2 className={`text-lg font-bold ${theme.classes.heading}`}>This address is not valid</h2>
      <p className={`mt-2 text-sm ${theme.classes.muted}`}>
        The link points to a record without a number (&ldquo;{id}&rdquo;). It is probably an old link or an
        outdated open tab. Open the record again from the list.
      </p>
      <Link
        className={`mt-4 inline-block rounded-xl px-5 py-2 text-sm font-semibold shadow-lg ${theme.classes.primaryButton}`}
        to={backTo}
      >
        {backLabel}
      </Link>
    </section>
  )
}

export default RequireNumericId
