import { ShieldCheck, User } from 'lucide-react'
import Logo from './Logo'
import { theme } from '../theme'

function LoginIllustration() {
  return (
    <section
      className={`relative hidden min-h-full flex-col justify-between overflow-hidden p-10 md:flex lg:p-12 ${theme.classes.panel}`}
    >
      <div>
        <div className="mb-10">
          <Logo />
        </div>

        <h1 className={`text-3xl font-bold ${theme.classes.heading}`}>
          Welcome Back
        </h1>
        <p className={`mt-3 max-w-xs leading-relaxed ${theme.classes.muted}`}>
          Log in to your MyAcademia account and continue managing academic
          work with confidence.
        </p>
      </div>

      <div className="relative mt-12 flex h-64 items-center justify-center">
        <div
          className={`absolute h-72 w-72 rounded-full border ${theme.classes.ringStrong}`}
        />
        <div
          className={`absolute h-56 w-56 -translate-x-6 translate-y-4 rounded-full border ${theme.classes.ringSoft}`}
        />

        <span
          className={`absolute left-10 top-2 h-2 w-2 rounded-full ${theme.classes.dot}`}
        />
        <span
          className={`absolute bottom-6 left-4 h-3 w-3 rounded-full ${theme.classes.dot}`}
        />
        <span
          className={`absolute right-8 top-6 h-3 w-3 rounded-full ${theme.classes.dotSoft}`}
        />
        <span
          className={`absolute bottom-2 right-16 h-4 w-4 rounded-full shadow-sm ${theme.classes.whiteBg}`}
        />

        <div className="relative flex items-end gap-3">
          <div
            className={`-mb-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg ${theme.classes.avatar}`}
          >
            <User
              className={theme.classes.whiteText}
              size={26}
              strokeWidth={2.2}
            />
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`-mb-3 h-16 w-14 rounded-t-full border-[10px] border-b-0 ${theme.classes.shackle}`}
            />

            <div
              className={`relative flex h-24 w-28 items-center justify-center rounded-2xl shadow-xl ${theme.classes.lockBody}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full ${theme.classes.lockDetail}`}
                />
                <div
                  className={`-mt-0.5 h-4 w-1.5 rounded-b ${theme.classes.lockDetail}`}
                />
              </div>
            </div>

            <div
              className={`-mt-3 flex h-8 w-32 items-center justify-center gap-1.5 rounded-full px-4 shadow-lg ${theme.classes.passwordBar}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${theme.classes.passwordDot}`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full ${theme.classes.passwordDot}`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full ${theme.classes.passwordDot}`}
              />
              <span
                className={`h-1.5 w-1.5 rounded-full ${theme.classes.passwordDot}`}
              />
              <span className={`ml-1 h-0.5 w-3 ${theme.classes.passwordLine}`} />
            </div>
          </div>

          <div className="-mb-2 h-16 w-14">
            <div
              className={`flex h-full w-full items-center justify-center shadow-lg ${theme.classes.shield}`}
              style={{
                clipPath:
                  'polygon(50% 0%, 100% 15%, 100% 60%, 50% 100%, 0% 60%, 0% 15%)',
              }}
            >
              <ShieldCheck
                className={theme.classes.whiteText}
                size={22}
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginIllustration
