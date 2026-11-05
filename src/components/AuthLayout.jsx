import LoginIllustration from './LoginIllustration'
import { theme } from '../theme'

// The two-column card used by the login page.
function AuthLayout({ children }) {
  return (
    <main
      className={`flex min-h-dvh w-full items-center justify-center px-3 py-3 sm:p-6 lg:p-8 ${theme.classes.page}`}
    >
      <div
        className={`grid w-full max-w-md grid-cols-1 overflow-hidden rounded-2xl sm:rounded-3xl md:min-h-[620px] md:max-w-5xl md:grid-cols-[0.95fr_1.05fr] lg:min-h-[680px] lg:grid-cols-2 ${theme.classes.card}`}
      >
        <LoginIllustration />
        <section className="flex flex-col justify-center px-5 py-7 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
