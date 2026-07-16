import LoginForm from '../components/LoginForm'
import LoginIllustration from '../components/LoginIllustration'
import { theme } from '../theme'

function LoginPage({ onLogin }) {
  return (
    <main
      className={`flex min-h-dvh w-full items-center justify-center px-3 py-3 sm:p-6 lg:p-8 ${theme.classes.page}`}
    >
      <div
        className={`grid w-full max-w-md grid-cols-1 overflow-hidden rounded-2xl sm:rounded-3xl md:min-h-[620px] md:max-w-5xl md:grid-cols-[0.95fr_1.05fr] lg:min-h-[680px] lg:grid-cols-2 ${theme.classes.card}`}
      >
        <LoginIllustration />
        <LoginForm onLogin={onLogin} />
      </div>
    </main>
  )
}

export default LoginPage
